
class AudioManager {
    private static instance: AudioManager;
    private sfxVolume: number = 0.5;
    private musicVolume: number = 0.3;
    private currentMusic: HTMLAudioElement | null = null;
    private currentMusicKey: string | null = null;


    private playlist: string[] = [
        "Ashes of the Keep.mp3",
        "Banner at the Old Stone Keep.mp3",
        "Banner at the Old Stone Keep (1).mp3",
        "Candlelit Keep.mp3",
        "Candlelit Keep (1).mp3",
        "Crown of Quiet Rooms.mp3",
        "Crown of Quiet Rooms (1).mp3"
    ];
    private playlistIndex: number = 0;
    private isPlaylistActive: boolean = false;
    private audioContext: AudioContext | null = null;
    private filterNode: BiquadFilterNode | null = null;
    private isMuffledState: boolean = false;

    private constructor() {
        const savedSfx = localStorage.getItem('sim_sfx_volume');
        const savedMusic = localStorage.getItem('sim_music_volume');
        const savedMuffled = localStorage.getItem('sim_music_muffled');

        if (savedSfx) this.sfxVolume = parseFloat(savedSfx);
        if (savedMusic) this.musicVolume = parseFloat(savedMusic);
        if (savedMuffled) this.isMuffledState = savedMuffled === 'true';

        // Shuffle playlist for variety
        this.playlist = this.playlist.sort(() => Math.random() - 0.5);
    }

    private initAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                this.filterNode = this.audioContext.createBiquadFilter();
                this.filterNode.type = 'lowpass';
                this.filterNode.frequency.setValueAtTime(this.isMuffledState ? 15000 : 20000, this.audioContext.currentTime);
                this.filterNode.connect(this.audioContext.destination);
            } catch (e) {
                console.error("Failed to initialize AudioContext", e);
            }
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
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

    public setMuffled(muffled: boolean) {
        this.isMuffledState = muffled;
        localStorage.setItem('sim_music_muffled', muffled.toString());

        if (this.filterNode && this.audioContext) {
            // Smooth transition for the filter
            this.filterNode.frequency.setTargetAtTime(
                muffled ? 15000 : 20000,
                this.audioContext.currentTime,
                0.1
            );
        }
    }

    public getSfxVolume() { return this.sfxVolume; }
    public getMusicVolume() { return this.musicVolume; }
    public isMuffled() { return this.isMuffledState; }

    public playSfx(key: string) {
        if (this.sfxVolume === 0) return;

        const filename = key.includes('.') ? key : `${key}.mp3`;
        const path = `/sounds/sfx/${filename}`;

        const audio = new Audio(path);
        audio.volume = this.sfxVolume;

        audio.play().catch(() => {
            // Expected if file doesn't exist
        });
    }

    public startPlaylist() {
        if (this.isPlaylistActive && this.currentMusic) return;
        this.isPlaylistActive = true;
        this.playNextInPlaylist();
    }

    private playNextInPlaylist() {
        if (!this.isPlaylistActive) return;

        const nextTrack = this.playlist[this.playlistIndex];
        this.playMusic(nextTrack, 2000, false);

        this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
    }

    public playMusic(key: string, fadeDuration: number = 1000, interruptPlaylist: boolean = true) {
        if (interruptPlaylist) {
            this.isPlaylistActive = false;
        }

        if (this.currentMusicKey === key) return;

        const filename = key.includes('.') ? key : `${key}.mp3`;
        const path = `/sounds/music/${filename}`;

        const newMusic = new Audio(path);
        newMusic.crossOrigin = "anonymous"; // May be needed for Web Audio API if files are on different domain
        newMusic.loop = !this.isPlaylistActive;
        newMusic.volume = 0;

        // Route through Web Audio API for filtering
        this.initAudioContext();
        if (this.audioContext && this.filterNode) {
            try {
                const source = this.audioContext.createMediaElementSource(newMusic);
                source.connect(this.filterNode);
            } catch (e) {
                console.warn("Could not route through Web Audio API, playing directly", e);
            }
        }

        // Add ended listener for playlist progression
        if (this.isPlaylistActive) {
            newMusic.addEventListener('ended', () => {
                this.playNextInPlaylist();
            });
        }

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
            if (this.isPlaylistActive) {
                // Try next track if this one fails
                this.playNextInPlaylist();
            }
        });
    }

    public stopMusic(fadeDuration: number = 1000) {
        this.isPlaylistActive = false;
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
