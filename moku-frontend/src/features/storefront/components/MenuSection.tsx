import CategoryBottomSheet from "@/features/storefront/components/CategoryBottomSheet";
import { CategoryFilter } from "@/features/storefront/components/CategoryFilter";
import { ListChevronsUpDown, Menu } from "lucide-react";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import { DynamicProductOrganizer } from "@/features/product/services/dynamicProductOrganizer";

interface MenuSectionProps {
    categories: Category[];
    products: Record<string, HomeProduct[]>;
}

function MenuSectionComponent({ categories: categoriesData, products }: MenuSectionProps) {
    const [activeCategory, setActiveCategory] = useState("");
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);
    const [menuTop, setMenuTop] = useState(0);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
    const userScrollTimeoutRef = useRef<number | null>(null);

    // Framer Motion spring configuration for smooth scrolling
    const scrollX = useMotionValue(0);
    const smoothScrollX = useSpring(scrollX, {
        stiffness: 120,
        damping: 25,
        mass: 0.3
    });

    const categoriesLoading = false;
    const categoriesError = null;

    // Get active category display name (default to "Menu" if no active category)
    const getActiveCategoryName = () => {
        if (!activeCategory || !categoriesData) return "Menu";
        const category = categoriesData.find(cat => cat.name === activeCategory);
        return category ? category.name : "Menu";
    };

    // Scroll the category filter to show the active category centered
    const scrollCategoryIntoView = useCallback((categoryName: string) => {
        if (!categoryScrollRef.current) return;

        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
            const container = categoryScrollRef.current;
            if (!container) return;

            const categoryElement = container.querySelector(`[data-category="${categoryName}"]`) as HTMLElement;

            if (categoryElement) {
                const containerWidth = container.offsetWidth;
                const containerScrollWidth = container.scrollWidth;

                // Get button position relative to viewport
                const buttonRect = categoryElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Position of button relative to container viewport
                const buttonLeftRelativeToContainer = buttonRect.left - containerRect.left;
                const buttonCenterRelativeToViewport = buttonLeftRelativeToContainer + buttonRect.width / 2;

                // Current scroll amount
                const currentScroll = container.scrollLeft;

                // Actual button center position in the scrollable area
                const buttonCenterInScroll = currentScroll + buttonCenterRelativeToViewport;

                // Target: button center should be at container center
                const containerCenter = containerWidth / 2;
                let targetScroll = buttonCenterInScroll - containerCenter;

                // Clamp to valid range
                targetScroll = Math.max(0, Math.min(targetScroll, containerScrollWidth - containerWidth));

                // Use Framer Motion for smooth scroll animation
                scrollX.set(targetScroll);
            }
        });
    }, [scrollX]);

    // Subscribe to smooth scroll changes and apply to container
    useEffect(() => {
        const unsubscribe = smoothScrollX.on("change", (latest) => {
            if (categoryScrollRef.current) {
                categoryScrollRef.current.scrollLeft = latest;
            }
        });

        return () => unsubscribe();
    }, [smoothScrollX]);

    // Initialize first category as active when data loads
    useEffect(() => {
        if (categoriesData && categoriesData.length > 0 && !activeCategory) {
            const firstCategory = categoriesData[0].name;
            setActiveCategory(firstCategory);
            // Delay to ensure DOM is fully rendered before scrolling
            setTimeout(() => {
                scrollCategoryIntoView(firstCategory);
            }, 150);
        }
    }, [categoriesData, activeCategory, scrollCategoryIntoView]);

    // Setup IntersectionObserver for section detection
    useEffect(() => {
        if (!categoriesData || categoriesData.length === 0) return;

        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create new observer with optimized options
        const observerOptions: IntersectionObserverInit = {
            root: null,
            rootMargin: '-120px 0px -50% 0px',
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        };

        const observerCallback: IntersectionObserverCallback = (entries) => {
            // Skip if user is manually scrolling
            if (isUserScrolling) return;

            // Find the section with highest intersection ratio
            let maxVisibleRatio = 0;
            let mostVisibleCategory = '';

            for (const entry of entries) {
                if (entry.isIntersecting && entry.intersectionRatio > maxVisibleRatio) {
                    maxVisibleRatio = entry.intersectionRatio;
                    const categoryName = (entry.target as HTMLElement).dataset.category;
                    if (categoryName) {
                        mostVisibleCategory = categoryName;
                    }
                }
            }

            // Update active category and scroll into view
            if (mostVisibleCategory && mostVisibleCategory !== activeCategory) {
                setActiveCategory(mostVisibleCategory);
                // Scroll category tab into view with delay to ensure state update
                setTimeout(() => {
                    scrollCategoryIntoView(mostVisibleCategory);
                }, 50);
            }
        };

        observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all category sections
        for (const category of categoriesData) {
            const categoryKey = category.name
                .toLowerCase()
                .replaceAll(/\s+/g, '-')
                .replaceAll(/[^a-z0-9-]/g, '');

            const element = document.getElementById(categoryKey);
            if (element) {
                element.dataset.category = category.name;
                sectionRefs.current.set(category.name, element);
                observerRef.current?.observe(element);
            }
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [categoriesData, isUserScrolling, activeCategory, scrollCategoryIntoView]);

    // Handle sticky menu behavior
    useEffect(() => {
        const handleScroll = () => {
            if (menuRef.current) {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (menuTop === 0 && menuRef.current) {
                    setMenuTop(menuRef.current.offsetTop);
                }

                if (scrollTop > menuTop) {
                    setIsSticky(true);
                } else {
                    setIsSticky(false);
                }
            }
        };

        // Set initial menu position
        if (menuRef.current && menuTop === 0) {
            setMenuTop(menuRef.current.offsetTop);
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [menuTop]);

    const handleOpenMenu = () => {
        setIsBottomSheetOpen(true);
    };

    const scrollToSection = useCallback((category: string) => {
        // Set user scrolling flag to prevent auto-detection during manual scroll
        setIsUserScrolling(true);

        // Clear any existing timeout
        if (userScrollTimeoutRef.current) {
            clearTimeout(userScrollTimeoutRef.current);
        }

        // Use centralized method to convert category name to element ID format
        const elementId = DynamicProductOrganizer.createSectionId(category);

        // Function to attempt scroll
        const attemptScroll = () => {
            const element = document.getElementById(elementId);

            if (element) {
                // Calculate offset based on sticky menu height
                const offset = 120;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                // Get max scrollable position
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

                // Use the minimum of calculated position and max scroll to handle last category
                const targetScroll = Math.min(offsetPosition, maxScroll);

                window.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });

                // Scroll category into view with a small delay to ensure scroll starts
                requestAnimationFrame(() => {
                    scrollCategoryIntoView(category);
                });

                // Reset user scrolling flag after scroll animation completes
                userScrollTimeoutRef.current = setTimeout(() => {
                    setIsUserScrolling(false);
                }, 1200);
            } else {
                // Element not rendered yet, wait and try again
                setTimeout(() => {
                    const retryElement = document.getElementById(elementId);
                    if (retryElement) {
                        attemptScroll();
                    } else {
                        console.error('Element still not found for category:', category, 'with ID:', elementId);
                        setIsUserScrolling(false);
                    }
                }, 300);
            }
        };

        attemptScroll();
    }, [scrollCategoryIntoView]);

    const handleTabChange = useCallback((category: string) => {
        // Update active category immediately for visual sync
        setActiveCategory(category);
        // Scroll category tab into view
        scrollCategoryIntoView(category);
        // Scroll to section
        scrollToSection(category);
        // Close bottom sheet if open
        setIsBottomSheetOpen(false);
    }, [scrollToSection, scrollCategoryIntoView]);

    // Handler specifically for BottomSheet menu selection
    const handleBottomSheetCategorySelect = useCallback((category: string) => {
        // Update active category immediately
        setActiveCategory(category);

        // Close bottom sheet first for better UX
        setIsBottomSheetOpen(false);

        // Longer delay to ensure bottom sheet is fully closed and DOM is ready
        setTimeout(() => {
            scrollToSection(category);
            scrollCategoryIntoView(category);
        }, 300);
    }, [scrollToSection, scrollCategoryIntoView]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (userScrollTimeoutRef.current) {
                clearTimeout(userScrollTimeoutRef.current);
            }
        };
    }, []);

    // Animation variants for the menu container
    const menuVariants = {
        sticky: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30
            }
        },
        relative: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 30
            }
        }
    };

    // Show loading state while categories are being fetched
    if (categoriesLoading) {
        return (
            <div ref={menuRef} className={isSticky ? 'py-4 mx-auto ' : ''}>
                <motion.div
                    className={`bg-white mx-auto max-w-[440px] transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-30 rounded-b-3xl shadow-sm max-w-[440px]' : 'relative'
                        }`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-row items-center max-w-[440px] mx-auto justify-center py-4">
                        <div className="flex items-center pl-4">
                            <motion.button
                                onClick={handleOpenMenu}
                                className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-white min-w-[100px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Menu className="w-6 h-6 text-gray-800 shrink-0" />
                                <span className="text-base font-medium text-gray-800 truncate capitalize max-w-20">
                                    {getActiveCategoryName()}
                                </span>
                            </motion.button>
                        </div>
                        <div className="overflow-x-auto scrollbar-hide flex-1">
                            <motion.div
                                className="flex items-center px-4 py-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-sm text-gray-500">Loading categories...</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Show error state if categories failed to load
    if (categoriesError) {
        return (
            <div ref={menuRef} className={isSticky ? 'py-4 mx-auto' : ''}>
                <motion.div
                    className={`bg-white mx-auto transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 right-0 z-30 rounded-b-3xl shadow-sm max-w-[440px]' : 'relative'
                        }`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-row items-center max-w-[440px] mx-auto justify-center py-4">
                        <div className="flex items-center pl-4">
                            <motion.button
                                onClick={handleOpenMenu}
                                className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-white min-w-[100px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ListChevronsUpDown className="w-6 h-6 text-gray-800 shrink-0" />
                                <span className="text-base font-medium text-gray-800 capitalize whitespace-nowrap">
                                    {getActiveCategoryName()}
                                </span>
                            </motion.button>
                        </div>
                        <div className="overflow-x-auto scrollbar-hide flex-1">
                            <motion.div
                                className="flex items-center px-4 py-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-sm text-red-500">Failed to load categories</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <div ref={menuRef} className={isSticky ? 'py-4 mx-auto' : ''}>
                <motion.div
                    className={`bg-white mx-auto ${isSticky ? 'fixed top-0 left-0 right-0 z-30 rounded-b-3xl shadow-sm max-w-[440px]' : 'relative'
                        }`}
                    variants={menuVariants}
                    animate={isSticky ? "sticky" : "relative"}
                    initial={false}
                >
                    <div className="flex flex-row items-center max-w-[440px] mx-auto justify-center py-2">
                        <div className="flex justify-center items-center pl-4">
                            <motion.button
                                onClick={handleOpenMenu}
                                className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-white min-w-[100px]"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <motion.div
                                    animate={{ rotate: isBottomSheetOpen ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ListChevronsUpDown className="w-6 h-6 text-gray-800 shrink-0" />
                                </motion.div>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={activeCategory}
                                        className="text-base font-medium text-gray-800 capitalize whitespace-nowrap truncate w-[72px]"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {getActiveCategoryName()}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.button>
                        </div>
                        <motion.div
                            className="overflow-x-auto justify-center items-center scrollbar-hide flex-1"
                            ref={categoryScrollRef}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            style={{ overflowY: 'hidden' }}
                        >
                            <CategoryFilter
                                categories={categoriesData || []}
                                activeCategory={activeCategory}
                                onCategoryChange={handleTabChange}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <CategoryBottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                categories={categoriesData || []}
                products={products || []}
                activeCategory={activeCategory}
                onCategorySelect={handleBottomSheetCategorySelect}
            />
        </>
    );
}

const MenuSection = memo(MenuSectionComponent);

export default MenuSection;