<?php

return [
    'va' => env('IPAYMU_VA'),
    'secret' => env('IPAYMU_SECRET'),
    'host' => env('IPAYMU_HOST'),
    'split_fee' => env('IPAYMU_SPLIT_FEE', 150), // biaya split payment default Rp. 150
];
