<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kami Merindukanmu!</title>
    @vite(['resources/backend/sass/app.scss'])
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .header {
            background: linear-gradient(135deg, #EA6A12 0%, #d45b0a 100%);
            padding: 30px;
            text-align: center;
        }

        .logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            background: white;
            border-radius: 50%;
            padding: 5px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .outlet-name {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .content {
            padding: 40px 30px;
            color: #374151;
            text-align: center;
        }

        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
        }

        .message {
            margin-bottom: 30px;
            font-size: 16px;
            color: #4b5563;
        }

        .btn {
            display: inline-block;
            background: #EA6A12;
            color: #ffffff !important;
            padding: 12px 32px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(234, 106, 18, 0.2);
        }

        .btn:hover {
            background: #d45b0a;
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(234, 106, 18, 0.3);
        }

        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            @if (isset($outletLogo))
                <img src="{{ $outletLogo }}" alt="{{ $outletName }}" class="logo">
            @endif
            <h1 class="outlet-name">{{ $outletName }}</h1>
        </div>

        <div class="content">
            <h2 class="greeting">Halo, {{ $customerName }}! 👋</h2>

            <p class="message">
                Sudah cukup lama sejak kunjungan terakhir Anda. Kami sangat menantikan kehadiran Anda kembali di
                {{ $outletName }}!
                <br><br>
                Kami memiliki menu-menu spesial yang menunggu untuk dicicipi. Yuk, mampir lagi dan nikmati suasana di
                outlet kami.
            </p>

            <div style="text-align: center;">
                <a href="{{ env('FE_APP_URL') }}" class="btn">Kunjungi Aplikasi</a>
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                <a href="{{ env('FE_APP_URL') }}" style="color: #EA6A12; text-decoration: none;">{{ env('FE_URL') }}</a>
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $outletName }}. All rights reserved.</p>
            <p>Powered by SpinoCafe</p>
        </div>
    </div>
</body>

</html>
