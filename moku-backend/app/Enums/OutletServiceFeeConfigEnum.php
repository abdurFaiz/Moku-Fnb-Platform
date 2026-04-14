<?php

declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Attributes\Description;
use BenSampo\Enum\Enum;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class OutletServiceFeeConfigEnum extends Enum
{
    #[Description('Paid by Outlet')]
    const PAID_BY_OUTLET = 1;

    #[Description('Paid by Customer')]
    const PAID_BY_CUSTOMER = 2;
}
