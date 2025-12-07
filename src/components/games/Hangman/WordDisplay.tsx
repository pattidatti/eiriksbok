import { motion } from 'framer-motion';
import clsx from 'clsx';

type WordDisplayProps = {
    wordToGuess: string;
    guessedLetters: string[];
    reveal?: boolean;
};

export const WordDisplay = ({ wordToGuess, guessedLetters, reveal = false }: WordDisplayProps) => {
    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 my-8 min-h-[4rem]">
            {wordToGuess.split("").map((letter, index) => {
                const isGuessed = guessedLetters.includes(letter.toUpperCase());
                const isSpace = letter === " ";
                const isSpecial = ["-", ":", ","].includes(letter);

                if (isSpace) {
                    return <div key={index} className="w-4 sm:w-8" />;
                }

                return (
                    <div key={index} className="flex flex-col items-center gap-1">
                        <span
                            className={clsx(
                                "w-8 h-12 sm:w-12 sm:h-16 border-b-4 flex items-center justify-center text-2xl sm:text-4xl font-bold transition-colors",
                                (isGuessed || isSpecial) ? "border-slate-800 dark:border-slate-200 text-slate-900 dark:text-white" :
                                    reveal ? "border-red-500 text-red-500" : "border-slate-400 dark:border-slate-600 text-transparent"
                            )}
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: (isGuessed || reveal || isSpecial) ? 1 : 0,
                                    y: (isGuessed || reveal || isSpecial) ? 0 : 10
                                }}
                            >
                                {letter.toUpperCase()}
                            </motion.span>
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
