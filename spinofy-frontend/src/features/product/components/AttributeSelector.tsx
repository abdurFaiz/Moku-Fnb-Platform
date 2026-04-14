import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductAttribute } from "@/features/product/types/DetailProduct";
import type React from "react";

interface Props {
    readonly attribute: ProductAttribute;
    readonly selected: Set<string>;
    readonly toggle: (
        setFn: (v: Set<string>) => void,
        current: Set<string>,
        value: string,
    ) => void;
}

export default function AttributeSelector({ attribute, selected, toggle }: Props) {
    const isRadio = attribute.display_type === 1; // 1 = radio (single select), 2 = checkbox (multi select)
    const selectedValue = isRadio ? Array.from(selected)[0] ?? '' : undefined;

    const handleSelect = (valueId: string) => {
        if (isRadio) {
            // For radio, clear all and set only the selected one
            toggle(() => { }, new Set([valueId]), valueId);
        } else {
            // For checkbox, toggle the value
            toggle(() => { }, selected, valueId);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, valueId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect(valueId);
        }
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-base text-title-black font-medium font-rubik capitalize">
                {attribute.name}
            </h2>

            {isRadio ? (
                <RadioGroup
                    value={selectedValue}
                    onValueChange={(valueId) => handleSelect(valueId)}
                    className="mt-2 gap-2"
                >
                    {attribute.values.map((value, idx) => {
                        const valueKey = `${attribute.id}-${value.id}`;

                        return (
                            <div
                                key={valueKey}
                                className={`cursor-pointer flex items-center justify-between py-2 ${idx === attribute.values.length - 1 ? "" : ""
                                    }`}
                            >
                                <div className="flex flex-col items-start flex-1">
                                    <label htmlFor={valueKey} className="text-base font-rubik capitalize text-title-black cursor-pointer">
                                        {value.name}
                                    </label>

                                </div>
                                <div className="flex flex-row gap-2">
                                    {value.extra_price > 0 && (
                                        <span className="text-sm font-medium text-gray-700">
                                            +Rp {value.extra_price.toLocaleString('id-ID')}
                                        </span>
                                    )}
                                    <RadioGroupItem value={valueKey} id={valueKey} className="border-body-grey/50" />
                                </div>
                            </div>
                        );
                    })}
                </RadioGroup>
            ) : (
                <div className="flex flex-col mt-2">
                    {attribute.values.map((value, idx) => {
                        const valueKey = `${attribute.id}-${value.id}`;
                        const isSelected = selected.has(valueKey);
                        return (
                            <button
                                key={valueKey}
                                type="button"
                                tabIndex={0}
                                onClick={() => handleSelect(valueKey)}
                                onKeyDown={(e) => handleKeyDown(e, valueKey)}
                                className={`cursor-pointer flex items-center justify-between py-3 ${idx === attribute.values.length - 1 ? "" : ""
                                    }`}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="text-base font-regular font-rubik capitalize text-title-black">
                                        {value.name}
                                    </span>
                                </div>
                                <div className="flex flex-row gap-2">
                                    {value.extra_price > 0 && (
                                        <span className="text-sm font-medium text-gray-700">
                                            +Rp {value.extra_price.toLocaleString('id-ID')}
                                        </span>
                                    )}
                                    <Checkbox
                                        checked={isSelected}
                                        className="pointer-events-none border-body-grey/50"
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
