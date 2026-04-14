import ClickSpark from "./ClickSpark";

export interface VoucherCardProps {
  title: string;
  subtitle: string;
  expiryDate: string;
  minTransaction?: string;
  minPoin?: string;
  maxUsage?: number;
  remainingUsage?: number;
  discoundPercent?: number;
  discoundFixedPrice?: number;
  status: "active" | "cancelled" | "disabled" | "expired" | "claimed";
  onClick?: () => void;
  voucherId?: number;
  isDisabled?: boolean;
  onClaimClick?: () => void;
}

export default function VoucherCard({
  title,
  subtitle,
  expiryDate,
  minTransaction,
  maxUsage,
  remainingUsage,
  discoundPercent,
  discoundFixedPrice,
  minPoin,
  status,
  onClick,
  onClaimClick,
  isDisabled = false,
}: VoucherCardProps) {
  const isButtonDisabled = () => {
    return (
      status === "disabled" ||
      status === "expired" ||
      status === "claimed" ||
      isDisabled
    );
  };

  const getButtonStyles = () => {
    switch (status) {
      case "claimed":
        return "bg-gray-200 text-gray-500 cursor-default";
      case "active":
        return "bg-orange-500 text-white hover:bg-orange-600";
      case "cancelled":
        return "bg-white text-red-600 border border-red-600 hover:bg-red-50";
      default:
        if (isButtonDisabled()) {
          return "bg-gray-300 text-white cursor-not-allowed";
        }
        return "bg-orange-500 text-white hover:bg-orange-600";
    }
  };

  const getButtonText = () => {
    if (status === "cancelled") {
      return "Batal";
    }
    if (status === "active") {
      return "Gunakan";
    }
    if (status === "claimed") {
      return "Sudah Diklaim";
    }
    return "Gunakan";
  };

  const getBorderColor = () => {
    switch (status) {
      case "active":
      case "cancelled":
        return "rgba(243, 95, 15, 0.5)";
      case "disabled":
        return "rgba(128, 128, 128, 0.24)";
      case "expired":
        return "rgba(128, 128, 128, 0.16)";
      case "claimed":
        return "rgba(128, 128, 128, 0.24)";
      default:
        return "rgba(243, 95, 15, 0.5)";
    }
  };

  let usageBadgeText: string | null = null;
  let usageBadgeClasses = "bg-primary-orange/25 text-primary-orange";

  if (typeof maxUsage === "number" && maxUsage > 0) {
    if (typeof remainingUsage === "number") {
      if (remainingUsage <= 0) {
        usageBadgeText = "Kuota Habis";
        usageBadgeClasses = "bg-gray-200 text-gray-600";
      } else if (remainingUsage < maxUsage) {
        usageBadgeText = `Sisa ${remainingUsage} / ${maxUsage}x`;
      } else {
        usageBadgeText = `Limit Pakai • ${maxUsage}x`;
      }
    } else {
      usageBadgeText = `Limit Pakai • ${maxUsage}x`;
    }
  }

  return (
    <div className="relative w-full h-[230px] group" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 374 153"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{
          filter: "drop-shadow(0 2px 2px rgba(128, 128, 128, 0.20))",
        }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M345.125 4C356.654 4 366 12.9543 366 24V54C366 56.2091 364.193 57.9612 362.021 58.3629C352.395 60.1428 345.125 68.258 345.125 78C345.125 87.742 352.395 95.857 362.021 97.637C364.193 98.039 366 99.791 366 102V132C366 143.046 356.654 152 345.125 152H28.8746C17.3459 152 8 143.046 8 132V102C8 99.791 9.80602 98.039 11.9783 97.637C20.4179 96.077 27.0461 89.646 28.5517 81.5188C28.7105 80.6617 29.433 80 30.3047 80C31.2442 80 32.0058 79.2384 32.0058 78.2988V77.7012C32.0058 76.7616 31.2442 76 30.3047 76C29.433 76 28.7105 75.3383 28.5517 74.4812C27.0461 66.3538 20.4179 59.9231 11.9783 58.3628C9.80602 57.9612 8 56.2091 8 54V24C8 12.9543 17.3459 4 28.8746 4H345.125ZM42.3557 76C41.2511 76 40.3557 76.8954 40.3557 78C40.3557 79.1046 41.2511 80 42.3557 80H46.7055C47.8101 80 48.7055 79.1046 48.7055 78C48.7055 76.8954 47.8101 76 46.7055 76H42.3557ZM59.0554 76C57.9508 76 57.0554 76.8954 57.0554 78C57.0554 79.1046 57.9508 80 59.0554 80H63.4053C64.5098 80 65.4053 79.1046 65.4053 78C65.4053 76.8954 64.5098 76 63.4053 76H59.0554ZM75.7551 76C74.6505 76 73.7551 76.8954 73.7551 78C73.7551 79.1046 74.6505 80 75.7551 80H80.105C81.2095 80 82.105 79.1046 82.105 78C82.105 76.8954 81.2095 76 80.105 76H75.7551ZM92.4548 76C91.3502 76 90.4548 76.8954 90.4548 78C90.4548 79.1046 91.3502 80 92.4548 80H96.8047C97.9092 80 98.8047 79.1046 98.8047 78C98.8047 76.8954 97.9092 76 96.8047 76H92.4548ZM109.155 76C108.05 76 107.155 76.8954 107.155 78C107.155 79.1046 108.05 80 109.155 80H113.504C114.609 80 115.504 79.1046 115.504 78C115.504 76.8954 114.609 76 113.504 76H109.155ZM125.854 76C124.75 76 123.854 76.8954 123.854 78C123.854 79.1046 124.75 80 125.854 80H130.204C131.309 80 132.204 79.1046 132.204 78C132.204 76.8954 131.309 76 130.204 76H125.854ZM142.554 76C141.449 76 140.554 76.8954 140.554 78C140.554 79.1046 141.449 80 142.554 80H146.904C148.008 80 148.904 79.1046 148.904 78C148.904 76.8954 148.008 76 146.904 76H142.554ZM159.254 76C158.149 76 157.254 76.8954 157.254 78C157.254 79.1046 158.149 80 159.254 80H163.604C164.708 80 165.604 79.1046 165.604 78C165.604 76.8954 164.708 76 163.604 76H159.254ZM175.953 76C174.849 76 173.953 76.8954 173.953 78C173.953 79.1046 174.849 80 175.953 80H180.303C181.408 80 182.303 79.1046 182.303 78C182.303 76.8954 181.408 76 180.303 76H175.953ZM192.653 76C191.548 76 190.653 76.8954 190.653 78C190.653 79.1046 191.548 80 192.653 80H197.003C198.107 80 199.003 79.1046 199.003 78C199.003 76.8954 198.107 76 197.003 76H192.653ZM209.353 76C208.248 76 207.353 76.8954 207.353 78C207.353 79.1046 208.248 80 209.353 80H213.703C214.807 80 215.703 79.1046 215.703 78C215.703 76.8954 214.807 76 213.703 76H209.353ZM226.052 76C224.948 76 224.052 76.8954 224.052 78C224.052 79.1046 224.948 80 226.052 80H230.402C231.507 80 232.402 79.1046 232.402 78C232.402 76.8954 231.507 76 230.402 76H226.052ZM242.752 76C241.648 76 240.752 76.8954 240.752 78C240.752 79.1046 241.648 80 242.752 80H247.102C248.207 80 249.102 79.1046 249.102 78C249.102 76.8954 248.207 76 247.102 76H242.752ZM259.452 76C258.347 76 257.452 76.8954 257.452 78C257.452 79.1046 258.347 80 259.452 80H263.802C264.906 80 265.802 79.1046 265.802 78C265.802 76.8954 264.906 76 263.802 76H259.452ZM276.152 76C275.047 76 274.152 76.8954 274.152 78C274.152 79.1046 275.047 80 276.152 80H280.501C281.606 80 282.501 79.1046 282.501 78C282.501 76.8954 281.606 76 280.501 76H276.152ZM292.851 76C291.747 76 290.851 76.8954 290.851 78C290.851 79.1046 291.747 80 292.851 80H297.201C298.306 80 299.201 79.1046 299.201 78C299.201 76.8954 298.306 76 297.201 76H292.851ZM309.551 76C308.446 76 307.551 76.8954 307.551 78C307.551 79.1046 308.446 80 309.551 80H313.901C315.005 80 315.901 79.1046 315.901 78C315.901 76.8954 315.005 76 313.901 76H309.551ZM326.251 76C325.146 76 324.251 76.8954 324.251 78C324.251 79.1046 325.146 80 326.251 80H330.601C331.705 80 332.601 79.1046 332.601 78C332.601 76.8954 331.705 76 330.601 76H326.251ZM342.95 76C341.846 76 340.95 76.8954 340.95 78C340.95 79.1046 341.846 80 342.95 80H343.125C344.23 80 345.125 79.1046 345.125 78C345.125 76.8954 344.23 76 343.125 76H342.95Z"
          fill="white"
        />
        <path
          d="M28.875 4.5H345.125C356.398 4.5 365.5 13.2504 365.5 24V54C365.5 55.9149 363.921 57.5028 361.93 57.8711C352.726 59.5731 345.605 66.9464 344.719 76.0742C344.286 75.7158 343.731 75.5 343.125 75.5H342.95C341.57 75.5001 340.45 76.6194 340.45 78C340.45 79.3806 341.57 80.4999 342.95 80.5H343.125C343.731 80.5 344.286 80.2834 344.719 79.9248C345.604 89.053 352.725 96.427 361.93 98.129C363.921 98.497 365.5 100.085 365.5 102V132C365.5 142.75 356.398 151.5 345.125 151.5H28.875C17.602 151.5 8.5 142.75 8.5 132V102C8.5 100.085 10.0778 98.497 12.0693 98.129C20.7011 96.533 27.4976 89.951 29.043 81.6094C29.1625 80.965 29.6983 80.5 30.3047 80.5C31.5203 80.5 32.5059 79.5145 32.5059 78.2988V77.7012C32.5059 76.4855 31.5203 75.5 30.3047 75.5C29.6982 75.5 29.1624 75.0343 29.043 74.3896C27.4974 66.0478 20.701 59.467 12.0693 57.8711C10.0778 57.5029 8.5 55.915 8.5 54V24C8.5 13.2504 17.602 4.5 28.875 4.5Z"
          stroke={getBorderColor()}
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {usageBadgeText && (
        <div className={`absolute top-1.5 right-2.5 flex flex-row gap-1 items-center justify-center w-fit rounded-bl-2xl rounded-tr-3xl ${usageBadgeClasses}`}>
          <span className="px-4 py-1 font-rubik text-sm leading-relaxed">
            {usageBadgeText}
          </span>
        </div>
      )}
      <div className="absolute inset-0 p-6 flex flex-col  justify-between">
        <div className="flex flex-col gap-1 mt-4">
          <h3 className="text-base font-medium text-title-black leading-tight line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{subtitle}</p>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-500">Berlaku Hingga</p>
              <p className="text-sm font-medium text-title-black">{expiryDate}</p>
            </div>
            {minTransaction ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500">Min. Transaksi</p>
                <p className="text-sm font-medium text-title-black">{minTransaction}</p>
              </div>
            ) : minPoin ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500">Min.Poin</p>
                <div className="flex flex-row gap-1 items-center">
                  <img loading="lazy" src="/icons/icon-poin.svg" alt="poin" className="size-4" />
                  <p className="text-sm font-medium text-title-black">{minPoin}</p>
                </div>
              </div>
            ) : null}
            {discoundPercent ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500">Max.Diskon</p>
                <p className="text-sm font-medium text-title-black">{discoundPercent}%</p>
              </div>
            ) : discoundFixedPrice ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-500">Max.Diskon</p>
                <p className="text-sm font-medium text-title-black">Rp {discoundFixedPrice.toLocaleString('id-ID')}</p>
              </div>
            ) : null}
          </div>
          <ClickSpark
            sparkColor="#E7E909"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
            extraScale={2}
          >
            <button
              onClick={onClaimClick}
              disabled={isButtonDisabled()}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${getButtonStyles()}`}
            >
              {getButtonText()}
            </button>
          </ClickSpark>
        </div>
      </div>
    </div>
  );
}