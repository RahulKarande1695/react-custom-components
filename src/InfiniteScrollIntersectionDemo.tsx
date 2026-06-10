import { useEffect, useRef, useState } from "react";

function InfiniteScrollIntersectionDemo() {
    const [data, setData] = useState<number[]>([...Array(60).keys()]);
    const arrayListRef = useRef<(HTMLDivElement | null)[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // old observer cleanup
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        });

        const lastElement =
            arrayListRef.current[arrayListRef.current.length - 1];

        if (lastElement) {
            observerRef.current.observe(lastElement);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [data]);

    function loadMore() {
        setTimeout(() => {
            setData((prev) => [
                ...prev,
                ...Array.from({ length: 10 }, (_, i) => prev.length + i),
            ]);
        }, 1000);
    }

    return (
        <div className="scroll-intersection-demo">
            {data.map((item, index) => (
                <div
                    ref={(el) => {
                        arrayListRef.current[index] = el;
                    }} 
                    className="row"
                    key={index}
                >
                    {item}
                </div>
            ))}
        </div>
    );
}

export default InfiniteScrollIntersectionDemo;