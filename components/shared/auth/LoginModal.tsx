"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";

export function LoginModal() {
    const { isOpen, closeLoginModal } = useAuthModalStore();

    return (
        <Dialog open={isOpen} onOpenChange={closeLoginModal}>
            <DialogContent className="sm:max-w-[425px] md:max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none text-left">
                <div className="bg-background rounded-xl overflow-hidden shadow-2xl">
                    <LoginForm />
                </div>
            </DialogContent>
        </Dialog>
    );
}
