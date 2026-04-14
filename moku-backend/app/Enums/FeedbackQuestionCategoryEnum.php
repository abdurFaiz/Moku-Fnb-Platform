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
final class FeedbackQuestionCategoryEnum extends Enum
{
    #[Description('General')]
    const GENERAL = 1;

    #[Description('Product')]
    const PRODUCT = 2;
}
