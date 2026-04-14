<?php

/**
 * @see https://github.com/artesaos/seotools
 */

return [
    'inertia' => env('SEO_TOOLS_INERTIA', false),
    'meta' => [
        /*
         * The default configurations to be used by the meta generator.
         */
        'defaults'       => [
            'title'        => "Spinofy - Website POS Cafe dengan Layanan Self Order", // set false to total remove
            'titleBefore'  => false, // Put defaults.title before page title, like 'It's Over 9000! - Dashboard'
            'description'  => 'Spinofy adalah solusi POS cafe yang menyediakan layanan self order untuk pelanggan. Dilengkapi dengan Customer Relationship Journey, Program Loyalitas & Poin, serta Analisa & Insight Data.', // set false to total remove
            'separator'    => ' - ',
            'keywords'     => ['Spinofy', 'POS Cafe', 'Self Order', 'Customer Relationship Journey', 'Program Loyalitas', 'Poin', 'Analisa & Insight Data'],
            'canonical'    => false, // Set to null or 'full' to use Url::full(), set to 'current' to use Url::current(), set false to total remove
            'robots'       => false, // Set to 'all', 'none' or any combination of index/noindex and follow/nofollow
        ],
        /*
         * Webmaster tags are always added.
         */
        'webmaster_tags' => [
            'google'    => null,
            'bing'      => null,
            'alexa'     => null,
            'pinterest' => null,
            'yandex'    => null,
            'norton'    => null,
        ],

        'add_notranslate_class' => false,
    ],
    'opengraph' => [
        /*
         * The default configurations to be used by the opengraph generator.
         */
        'defaults' => [
            'title'       => 'Spinofy - Website POS Cafe dengan Layanan Self Order', // set false to total remove
            'description' => 'Spinofy adalah solusi POS cafe yang menyediakan layanan self order untuk pelanggan. Dilengkapi dengan Customer Relationship Journey, Program Loyalitas & Poin, serta Analisa & Insight Data.', // set false to total remove
            'url'         => false, // Set null for using Url::current(), set false to total remove
            'type'        => false,
            'site_name'   => false,
            'images'      => [
                config('app.url') . '/assets/images/logo/spinofy_logo_symbol.png',
            ],
        ],
    ],
    'twitter' => [
        /*
         * The default values to be used by the twitter cards generator.
         */
        'defaults' => [
            //'card'        => 'summary',
            //'site'        => '@LuizVinicius73',
        ],
    ],
    'json-ld' => [
        /*
         * The default configurations to be used by the json-ld generator.
         */
        'defaults' => [
            'title'       => 'Spinofy - Website     POS Cafe dengan Layanan Self Order', // set false to total remove
            'description' => 'Spinofy adalah solusi POS cafe yang menyediakan layanan self order untuk pelanggan. Dilengkapi dengan Customer Relationship Journey, Program Loyalitas & Poin, serta Analisa & Insight Data.', // set false to total remove
            'url'         => false, // Set to null or 'full' to use Url::full(), set to 'current' to use Url::current(), set false to total remove
            'type'        => 'WebPage',
            'images'      => [
                config('app.url') . '/assets/images/logo/spinofy_logo_symbol.png',
            ],
        ],
    ],
];
