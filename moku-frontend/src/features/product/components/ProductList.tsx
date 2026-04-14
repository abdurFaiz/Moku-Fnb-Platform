interface ProductListProps {
    children: React.ReactNode;
}
export const ProductList = ({ children }: ProductListProps) => {
    return (
        <div className="">
            {children}
        </div>
    )
}