import React from 'react';

interface WelcomeHeroProps {
    /**
     * Image source URL
     * @default "/images/welcome-image.png"
     */
    imageSrc?: string;
    /**
     * Alternative text for the image
     * @default "Woman using phone in cafe"
     */
    imageAlt?: string;
    /**
     * Main headline text
     * @default "Pesan Semudah Chatting!"
     */
    headline?: string;
    /**
     * Supporting description text
     * @default "Scan QR di mejamu, pilih menu, dan pesan langsung dari HP kamu. Praktis!"
     */
    description?: string;
}

const DEFAULT_WELCOME_HERO_PROPS: Required<WelcomeHeroProps> = {
    imageSrc: '/images/welcome-image.webp',
    imageAlt: 'Woman using phone in cafe',
    headline: 'Pesan Semudah Chatting!',
    description: 'Scan QR di mejamu, pilih menu, dan pesan langsung dari HP kamu. Praktis!',
};

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
    imageSrc = DEFAULT_WELCOME_HERO_PROPS.imageSrc,
    imageAlt = DEFAULT_WELCOME_HERO_PROPS.imageAlt,
    headline = DEFAULT_WELCOME_HERO_PROPS.headline,
    description = DEFAULT_WELCOME_HERO_PROPS.description,
}) => {
    return (
        <>
            {/* Hero Image Section */}
            <div className="relative w-full">
                <img
                    loading="eager"
                    fetchPriority="high"
                    style={{ contentVisibility: 'auto' }}
                    decoding='async'
                    width={440}
                    height={572}
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-full object-cover rounded-b-[28px]"
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-between -mt-10 z-20 px-4">
                <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
                    {/* Text Content */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-title-black leading-tight font-rubik">
                            {headline}
                        </h1>
                        <p className="text-base text-body-grey leading-normal">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
