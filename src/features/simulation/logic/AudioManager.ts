
class AudioManager {
    private static instance: AudioManager;
    private sfxVolume: number = 0.5;
    private musicVolume: number = 0.3;
    private currentMusic: HTMLAudioElement | null = null;
    private currentMusicKey: string | null = null;


    private constructor() {
        const savedSfx = localStorage.getItem('sim_sfx_volume');
        const savedMusic = localStorage.getItem('sim_music_volume');
        if (savedSfx) this.sfxVolume = parseFloat(savedSfx);
        if (savedMusic) this.musicVolume = parseFloat(savedMusic);
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public setSfxVolume(volume: number) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sim_sfx_volume', this.sfxVolume.toString());
    }

    public setMusicVolume(volume: number) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sim_music_volume', this.musicVolume.toString());
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    public getSfxVolume() { return this.sfxVolume; }
    public getMusicVolume() { return this.musicVolume; }

    public playSfx(key: string) {
        if (this.sfxVolume === 0) return;

        // Simple cache to avoid reloading same sound rapidly
        // But for rapid fire (typing/mining), we might need clones to allow overlap
        // cloning node is better for overlap

        const path = `/sounds/sfx/${key}.mp3`; // Assumes .mp3 for now, could be passed in config

        const audio = new Audio(path);
        audio.volume = this.sfxVolume;

        audio.play().catch(e => {
            // console.warn(`Failed to play sfx: ${key}`, e);
            // Expected if file doesn't exist
        });
    }

    public playMusic(key: string, fadeDuration: number = 1000) {
        if (this.currentMusicKey === key) return; // Already playing

        const path = `/sounds/music/${key}.mp3`;

        const newMusic = new Audio(path);
        newMusic.loop = true;
        newMusic.volume = 0; // Start at 0 for fade in

        // Fade out current
        if (this.currentMusic) {
            const oldMusic = this.currentMusic;
            this.fadeOut(oldMusic, fadeDuration);
        }

        this.currentMusic = newMusic;
        this.currentMusicKey = key;

        newMusic.play().then(() => {
            this.fadeIn(newMusic, this.musicVolume, fadeDuration);
        }).catch(e => {
            console.warn(`Failed to play music: ${key}`, e);
            this.currentMusic = null;
            this.currentMusicKey = null;
        });
    }

    public stopMusic(fadeDuration: number = 1000) {
        if (this.currentMusic) {
            this.fadeOut(this.currentMusic, fadeDuration);
            this.currentMusic = null;
            this.currentMusicKey = null;
        }
    }

    private fadeOut(audio: HTMLAudioElement, duration: number) {
        const startVolume = audio.volume;
        const steps = 20;
        const stepTime = duration / steps;
        const volStep = startVolume / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const newVol = startVolume - (volStep * currentStep);
            if (newVol <= 0) {
                audio.volume = 0;
                audio.pause();
                clearInterval(interval);
            } else {
                audio.volume = newVol;
            }
        }, stepTime);
    }

    private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number) {
        if (targetVolume === 0) return;
        audio.volume = 0;

        const steps = 20;
        const stepTime = duration / steps;
        const volStep = targetVolume / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const newVol = volStep * currentStep;
            if (newVol >= targetVolume) {
                audio.volume = targetVolume;
                clearInterval(interval);
            } else {
                audio.volume = newVol;
            }
        }, stepTime);
    }

}

export const audioManager = AudioManager.getInstance();
