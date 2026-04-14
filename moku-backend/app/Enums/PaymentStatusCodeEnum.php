<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Attributes\Description;
use BenSampo\Enum\Enum;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class PaymentStatusCodeEnum extends Enum
{
    #[Description('Being Processed')]
    const BEING_PROCESSED = -1;

    #[Description('Pending')]
    const PENDING = 0;

    #[Description('Success')]
    const SUCCESS = 1;

    #[Description('Canceled')]
    const CANCELED = 2;

    #[Description('Refunded')]
    const REFUNDED = 3;

    #[Description('Waiting for Payment')]
    const WAITING_FOR_PAYMENT = 4;

    #[Description('Waiting for Settlement')]
    const WAITING_FOR_SETTLEMENT = 6;
}
