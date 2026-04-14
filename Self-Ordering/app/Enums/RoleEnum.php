<?php

declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

final class RoleEnum extends Enum
{
    const ADMIN_SPINOTEK = 'admin spinotek'; // Admin Spinotek
    const OUTLET = 'outlet'; // Kasir|Admin Outlet
    const CUSTOMER = 'customer'; // Customer
}
