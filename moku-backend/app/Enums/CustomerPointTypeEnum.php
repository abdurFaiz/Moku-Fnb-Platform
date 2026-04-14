<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Attributes\Description;
use BenSampo\Enum\Enum;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class CustomerPointTypeEnum extends Enum
{
    #[Description('Pemasukan')]
    const CREDIT = 1;

    #[Description('Pengeluaran')]
    const DEBIT = 2;
}
