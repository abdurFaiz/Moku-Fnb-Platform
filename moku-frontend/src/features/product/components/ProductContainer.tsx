interface ProductContainerProps {
    children: React.ReactNode;
    id?: string
}

export const ProductContainer = ({ children, id }: ProductContainerProps) => {
    return (
        <section id={id} className="p-4 flex flex-col gap-4">
            {children}
        </section>
    )
}