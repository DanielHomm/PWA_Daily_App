import { useState } from "react";
import toast from "react-hot-toast";

export function useRecipeImport() {
    const [isLoading, setIsLoading] = useState(false);

    const extractRecipe = async (url, language) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/ai/extract-recipe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, language }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to extract recipe");
            }

            toast.success("Recipe extracted!");
            return data;
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        extractRecipe,
        isLoading
    };
}
