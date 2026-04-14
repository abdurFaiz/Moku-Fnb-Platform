<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class ProductAttributeDisplayTypeEnum extends Enum
{
    const RADIO = 1;
    const MULTICHECKBOX = 2;
    const PILLBADGE = 3;

    public function label(): string
    {
        return match ($this){
            self::RADIO => 'Radio',
            self::MULTICHECKBOX => 'Multicheckbox',
            self::PILLBADGE => 'Pill Badge',
        };
    }
}
