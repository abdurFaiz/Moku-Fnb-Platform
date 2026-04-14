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
final class OutletTypeEnum extends Enum
{
    #[Description('Table Service')]
    const TABLESERVICE = 1;

    #[Description('Pickup Cashier')]
    const PICKUP = 2;

    #[Description('All')]
    const ALL = 3;
}
