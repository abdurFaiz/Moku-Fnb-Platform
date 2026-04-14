interface ItemDetailsProps {
  name: string;
  notes?: string | null;
  options?: string[];
}

export function ItemDetails({
  name,
  notes,
  options,
}: ItemDetailsProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-rubik font-medium capitalize">{name}</h2>
      <div className="flex flex-col gap-1">
        {options && options.length > 0 && (
          <div className="text-xs font-rubik text-body capitalize text-body-grey">
            <span>Pilihan:</span>
            <div className="flex flex-col mt-1">
              {options.map((option, index) => (
                <span key={index}>• {option}</span>
              ))}
            </div>
          </div>
        )}
        {notes && (
          <p className="text-xs font-rubik text-body capitalize">
            Notes: {notes}
          </p>
        )}
      </div>
    </div>
  );
}
