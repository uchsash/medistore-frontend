"use client"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import { useEffect } from "react";

export default function CommonError({error, reset}: {error: Error & {digest?: string}; reset: () => void;}) {
    useEffect(() => {
        console.error(error);
    }, []);

    return (
        <div className="flex flex-col max-w-full items-center justify-center gap-4">
            <Alert variant="destructive" className="max-w-md">
                <AlertCircleIcon />
                <AlertTitle>Something Went wrong!</AlertTitle>
                <AlertDescription>
                    Please, try again later.
                </AlertDescription>
                <div className="flex items-center mx-auto justify-center">
                    <Button className="px-2 mt-2 w-fit" onClick={() => reset()}> Retry
                </Button>
                </div>
            </Alert>
        </div>
    );
}