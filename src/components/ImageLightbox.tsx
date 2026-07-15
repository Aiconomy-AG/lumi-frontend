import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface ImageLightboxProps {
    src: string
    alt?: string
    title: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ImageLightbox({ src, alt = '', title, open, onOpenChange }: ImageLightboxProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-auto max-w-[95vw] border-0 bg-transparent p-0 ring-0 sm:max-w-3xl">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <img src={src} alt={alt} className="max-h-[85vh] w-auto rounded-lg object-contain" />
            </DialogContent>
        </Dialog>
    )
}
