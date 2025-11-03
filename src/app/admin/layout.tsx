'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminLayoutSkeleton = () => (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-8 border rounded-lg p-6">
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    </div>
);


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) return; // Wait until user data is loaded

        if (!user) {
            router.push('/login');
            return;
        }

        // @ts-ignore - 'role' is not on the default User type but we add it.
        if (user.role !== 'admin') {
            router.push('/'); // Redirect to home if not an admin
        }
    }, [user, isUserLoading, router]);

    // @ts-ignore
    if (isUserLoading || !user || user.role !== 'admin') {
        // Render a skeleton or loading state while checking permissions,
        // or before the redirect happens to prevent flashing content.
        return <AdminLayoutSkeleton />;
    }

    return <>{children}</>;
}
