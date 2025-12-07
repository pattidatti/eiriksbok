import clsx from 'clsx';
import { motion } from 'framer-motion';

type KeyboardProps = {
    disabled?: boolean;
    activeLetters: string[];
    inactiveLetters: string[];
    addGuessedLetter: (letter: string) => void;
};

const KEYS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'Æ', 'Ø', 'Å'
];

export const Keyboard = ({
    disabled = false,
    activeLetters,
    inactiveLetters,
    addGuessedLetter,
}: KeyboardProps) => {
    return (
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto p-4">
            {KEYS.map((key) => {
                const isActive = activeLetters.includes(key);
                const isInactive = inactiveLetters.includes(key);

                return (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        key={key}
                        onClick={() => addGuessedLetter(key)}
                        disabled={isActive || isInactive || disabled}
                        className={clsx(
                            "w-10 h-12 sm:w-12 sm:h-14 rounded-lg font-bold text-lg sm:text-xl transition-colors shadow-md",
                            isActive && "bg-green-500 text-white border-green-600",
                            isInactive && "bg-slate-300 text-slate-500 cursor-not-allowed opacity-50",
                            !isActive && !isInactive && "bg-white text-slate-900 border border-slate-200 hover:bg-sky-50 hover:border-sky-300"
                        )}
                    >
                        {key}
                    </motion.button>
                );
            })}
        </div>
    );
};
