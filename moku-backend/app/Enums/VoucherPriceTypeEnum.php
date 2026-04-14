<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Attributes\Description;
use BenSampo\Enum\Enum;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class VoucherPriceTypeEnum extends Enum
{
    #[Description('Diskon Persentase')]
    const PERCENT = 1;

    #[Description('Diskon Fix')]
    const FIXED = 2;
}
