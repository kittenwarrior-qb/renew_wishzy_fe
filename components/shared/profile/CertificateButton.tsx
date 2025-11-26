'use client';

import { Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Enrollment } from '@/types/enrollment';

interface CertificateButtonProps {
  enrollment: Enrollment;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function CertificateButton({ 
  enrollment, 
  variant = 'outline',
  size = 'default' 
}: CertificateButtonProps) {
  const router = useRouter();

  if (enrollment.progress < 100 || !enrollment.certificateUrl) {
    return null;
  }

  const handleClick = () => {
    router.push(`/certificates/${enrollment.id}`);
  };

  return (
    <Button 
      onClick={handleClick}
      variant={variant}
      size={size}
      className="gap-2"
    >
      <Award className="h-4 w-4" />
      View Certificate
    </Button>
  );
}
