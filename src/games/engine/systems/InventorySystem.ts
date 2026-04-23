// Fase 4.2: inventar-system. Enkel slot-basert struktur der hvert slot
// inneholder en stackbar item. Persistens er ikke implementert her — det
// kommer i Fase 5 (save/load).

export interface ItemDef {
    id: string;
    name: string;
    description: string;
    icon: string;          // emoji eller URL til PNG; UI-rendering velger
    stackable?: boolean;   // default false
    maxStack?: number;     // default 1 (eller 99 hvis stackable)
}

export interface InventorySlot {
    itemId: string;
    count: number;
}

export type InventoryListener = () => void;

export class InventorySystem {
    private items = new Map<string, ItemDef>();
    private slots: InventorySlot[] = [];
    private maxSlots: number;
    private listeners = new Set<InventoryListener>();

    constructor(defs: ItemDef[] = [], maxSlots = 16) {
        for (const d of defs) this.items.set(d.id, d);
        this.maxSlots = maxSlots;
    }

    /** Abonner på endringer. Kalles hver gang slot endrer innhold. */
    subscribe(fn: InventoryListener): () => void {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    /** Legg til item. Returnerer true hvis det fikk plass (eksisterende stack eller nytt slot). */
    add(itemId: string, count = 1): boolean {
        const def = this.items.get(itemId);
        if (!def) return false;
        if (def.stackable) {
            const max = def.maxStack ?? 99;
            // Forsøk først å legge til i eksisterende stack
            for (const s of this.slots) {
                if (s.itemId === itemId && s.count < max) {
                    const room = max - s.count;
                    const add = Math.min(room, count);
                    s.count += add;
                    count -= add;
                    if (count <= 0) {
                        this.notify();
                        return true;
                    }
                }
            }
        }
        // Nytt slot hvis det er plass
        while (count > 0 && this.slots.length < this.maxSlots) {
            const max = def.stackable ? (def.maxStack ?? 99) : 1;
            const add = Math.min(max, count);
            this.slots.push({ itemId, count: add });
            count -= add;
        }
        this.notify();
        return count <= 0;
    }

    /** Fjern item. Returnerer true hvis nok i inventaret til å fjerne count. */
    remove(itemId: string, count = 1): boolean {
        let remaining = count;
        for (let i = this.slots.length - 1; i >= 0 && remaining > 0; i--) {
            const s = this.slots[i];
            if (s.itemId !== itemId) continue;
            const take = Math.min(s.count, remaining);
            s.count -= take;
            remaining -= take;
            if (s.count === 0) this.slots.splice(i, 1);
        }
        this.notify();
        return remaining === 0;
    }

    has(itemId: string): boolean {
        return this.slots.some((s) => s.itemId === itemId && s.count > 0);
    }

    count(itemId: string): number {
        let sum = 0;
        for (const s of this.slots) if (s.itemId === itemId) sum += s.count;
        return sum;
    }

    getSlots(): ReadonlyArray<InventorySlot> {
        return this.slots;
    }

    getItemDef(id: string): ItemDef | undefined {
        return this.items.get(id);
    }

    /** Bruk et item (kaller useAction hvis definert). useAction returneres via GameConfig. */
    use(itemId: string): boolean {
        const def = this.items.get(itemId);
        if (!def) return false;
        if (!this.has(itemId)) return false;
        // useAction kalles eksternt — GameEngine vet om konsumert/ikke.
        return true;
    }

    private notify(): void {
        for (const fn of this.listeners) fn();
    }

    dispose(): void {
        this.listeners.clear();
        this.slots.length = 0;
        this.items.clear();
    }
}
