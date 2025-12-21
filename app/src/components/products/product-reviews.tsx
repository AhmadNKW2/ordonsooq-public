"use client";

import { useState } from "react";
import { Star, ThumbsUp, MessageSquare, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card } from "@/components/ui";

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    content: string;
    likes: number;
    avatar?: string;
    verified?: boolean;
}

interface ProductReviewsProps {
    rating: number;
    reviewCount: number;
    reviews?: Review[]; // Optional for now, we can mock if empty
}

// Mock data generator
const generateMockReviews = (count: number): Review[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `review-${i}`,
        author: `User ${i + 1}`,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        likes: Math.floor(Math.random() * 20),
        verified: Math.random() > 0.3,
    }));
};

export function ProductReviews({ rating, reviewCount, reviews: initialReviews }: ProductReviewsProps) {
    const [reviews] = useState<Review[]>(initialReviews || generateMockReviews(Math.min(reviewCount, 5)));

    // Calculate rating distribution (mock data or 0 if no reviews)
    const distribution = reviewCount > 0 ? {
        5: 70,
        4: 20,
        3: 5,
        2: 3,
        1: 2,
    } : {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-1">Customer Reviews</h2>

            <Card className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Rating Summary */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-6 bg-gray-50/50 border-none">
                        <div className="flex items-end gap-4 mb-6">
                            <div>
                                <div className="text-5xl font-bold text-primary mb-1">{rating.toFixed(1)}</div>
                                <div className="flex items-center gap-1 text-secondary mb-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "w-5 h-5 fill-current",
                                                i < Math.round(rating) ? "text-secondary" : "text-gray-300"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-third font-medium">{reviewCount} Verified Reviews</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                        <span className="font-medium text-primary">{star}</span>
                                        <Star className="w-3 h-3 text-third fill-current" />
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-secondary rounded-full"
                                            style={{ width: `${distribution[star as keyof typeof distribution]}%` }}
                                        />
                                    </div>
                                    <div className="w-10 text-right text-third shrink-0">
                                        {distribution[star as keyof typeof distribution]}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-primary">Review this product</h3>
                        <p className="text-sm text-third">Share your thoughts with other customers</p>
                        <Button className="w-full">Write a Review</Button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-8 space-y-6">
                    {reviews.length === 0 ? (
                        <div className="text-center h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary mb-2">No reviews yet</h3>
                            <p className="text-third mb-6 max-w-md mx-auto">
                                Be the first to review this product and help others make a decision.
                            </p>
                            <Button variant="outline">Write a Review</Button>
                        </div>
                    ) : (
                        <>
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold text-lg">
                                                {review.author.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-primary">{review.author}</h4>
                                                    {review.verified && (
                                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                                            Verified Purchase
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-third mt-0.5">
                                                    <div className="flex items-center text-secondary">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "w-3 h-3 fill-current",
                                                                    i < review.rating ? "text-secondary" : "text-gray-300"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span>•</span>
                                                    <span>{review.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-third hover:text-primary transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="pl-[52px]">
                                        <p className="text-gray-600 leading-relaxed mb-4">
                                            {review.content}
                                        </p>

                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-1.5 text-sm text-third hover:text-primary transition-colors group">
                                                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Helpful ({review.likes})</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-sm text-third hover:text-primary transition-colors group">
                                                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Comment</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {reviewCount > 5 && (
                                <div className="pt-4 text-center">
                                    <Button variant="outline" className="min-w-[200px]">
                                        Load More Reviews
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
