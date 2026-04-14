<!DOCTYPE html>
<html>

<head>
    <title>Feedback Request</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #ffffff;
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }

        .header img {
            max-height: 80px;
            width: auto;
        }

        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }

        .h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .btn-wrapper {
            text-align: center;
            margin: 30px 0;
        }

        .btn {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background-color: #45a049;
        }

        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #888888;
        }

        .link-fallback {
            margin-top: 20px;
            font-size: 12px;
            color: #666666;
            word-break: break-all;
        }

        .link-fallback a {
            color: #4CAF50;
            text-decoration: none;
        }

        /* Logo responsiveness */
        .logo-img {
            max-height: 80px;
            width: auto;
            max-width: 100%;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            @if (isset($outletLogo) && $outletLogo)
                <img src="{{ $outletLogo }}" class="logo-img" alt="{{ $outletName }}">
            @else
                <h2>{{ $outletName }}</h2>
            @endif
        </div>

        <div class="content">
            <h1 class="h1">Hai, {{ $customerName }}!</h1>

            <p>Terima kasih telah berbelanja di <strong>{{ $outletName }}</strong>. Kami harap Anda menikmati pesanan
                Anda.</p>

            <p>Pengalaman Anda sangat berarti bagi kami. Luangkan waktu sejenak untuk memberikan penilaian agar kami
                dapat melayani Anda lebih baik lagi.</p>

            <div class="btn-wrapper">
                <a href="{{ $url }}" class="btn">Beri Penilaian</a>
            </div>

            {{-- <div class="link-fallback">
                <p>Jika tombol di atas tidak berfungsi, salin dan tempel link berikut ke browser Anda:</p>
                <a href="{{ $url }}">{{ $url }}</a>
            </div> --}}
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $outletName }}. All rights reserved.</p>
            <p>Powered by SpinoCafe</p>
        </div>
    </div>
</body>

</html>
