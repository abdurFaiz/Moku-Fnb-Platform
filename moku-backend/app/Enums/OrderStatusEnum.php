<?php declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;
use BenSampo\Enum\Attributes\Description;

/**
 * @method static static OptionOne()
 * @method static static OptionTwo()
 * @method static static OptionThree()
 */
final class OrderStatusEnum extends Enum
{
    #[Description('Pending')]
    const PENDING = 1;

    #[Description('Menunggu Konfirmasi')]
    const WAITING_CONFIRMATION = 2;

    #[Description('Pesanan dalam proses')]
    const SUCCESS = 3;

    #[Description('Selesai')]
    const COMPLETED = 4;

    #[Description('Gagal')]
    const FAILED = 5;

    #[Description('Expired')]
    const EXPIRED = 6;

    #[Description('Challenge')]
    const CHALLENGE = 7;

    #[Description('Dibatalkan')]
    const CANCEL = 8;

    #[Description('Ditolak')]
    const REJECT = 9;

    public static function forFilterOrder(): array
    {
        return [
            self::PENDING,
            self::WAITING_CONFIRMATION,
            self::SUCCESS,
            self::FAILED,
            self::EXPIRED,
            self::CHALLENGE,
            self::CANCEL,
            self::REJECT,
        ];
    }

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::WAITING_CONFIRMATION => 'Menunggu Konfirmasi',
            self::SUCCESS => 'Sukses',
            self::COMPLETED => 'Selesai',
            self::FAILED => 'Gagal',
            self::EXPIRED => 'Expired',
            self::CHALLENGE => 'Challenge',
            self::CANCEL => 'Dibatalkan',
            self::REJECT => 'Ditolak',
        };
    }
}
