<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Attributes\Description;
use BenSampo\Enum\Enum;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class VoucherClaimTypeEnum extends Enum
{
    #[Description('Platform')]
    const PLATFORM = 1;

    #[Description('Admin')]
    const ADMIN = 2;
}
