<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Attributes\Description;
use BenSampo\Enum\Enum;

/**
 * @method static static PUBLIC()
 * @method static static PRIVATE()
 */
final class VoucherTypeEnum extends Enum
{
    #[Description('Public')]
    const PUBLIC = 1;

    #[Description('Private')]
    const PRIVATE = 2;

    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Public',
            self::PRIVATE => 'Private',
        };
    }
}
