'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building, ExternalLink } from 'lucide-react';
import { useCompanyStore } from '@/store/companyStore';
import { cn } from '@/lib/utils';

/**
 * Company Logos Dialog Component
 * Displays a popup with company logos when clicking on company names
 * Supports showing logos for multiple companies with their names and URLs
 */
export function CompanyLogosDialog({
  isOpen,
  onOpenChange,
  companyIds = [],
  title = 'Companies',
}) {
  const { getCompanyFromCache, getCompanyById } = useCompanyStore();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const companyData = await Promise.all(
        companyIds.map(async id => {
          // Try to get from cache first
          let company = getCompanyFromCache(id);
          if (!company) {
            // If not in cache, fetch from API
            company = await getCompanyById(id);
          }
          return company ? { id, ...company } : null;
        })
      );

      // Filter out null values
      setCompanies(companyData.filter(Boolean));
    } catch {
      console.error('Error fetching companies:');
    } finally {
      setIsLoading(false);
    }
  }, [companyIds, getCompanyFromCache, getCompanyById]);

  useEffect(() => {
    if (isOpen && companyIds.length > 0) {
      fetchCompanies();
    }
  }, [isOpen, companyIds, fetchCompanies]);

  const getLogoUrl = company => {
    // If company has a custom logo, use it
    if (company.logo) {
      return company.logo;
    }

    // Otherwise, try to generate a logo URL based on the company name
    // This uses a simple approach - you might want to enhance this with a logo API
    return getDefaultLogoUrl(company.name);
  };

  const getDefaultLogoUrl = companyName => {
    // Common company logos - you can expand this list
    const logoMap = {
      google:
        'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      meta: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
      facebook:
        'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
      microsoft:
        'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      amazon:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png',
      apple:
        'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      netflix:
        'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
      spotify:
        'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
      tesla:
        'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
      twitter:
        'https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg',
      linkedin:
        'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
      uber: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
      airbnb:
        'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg',
      paypal: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
      oracle:
        'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
      nvidia:
        'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
      intel:
        'https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg',
      ibm: 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
      salesforce:
        'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
      adobe:
        'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg',
    };

    const normalizedName = companyName.toLowerCase().trim();
    return logoMap[normalizedName] || null;
  };

  const handleCompanyClick = company => {
    if (company.url) {
      try {
        // Validate URL before opening
        const url = new URL(company.url);
        window.open(url.href, '_blank', 'noopener,noreferrer');
      } catch {
        console.warn('Invalid URL:', company.url);
        // Try to open with https:// prefix if it's just a domain
        try {
          const fallbackUrl = company.url.startsWith('http')
            ? company.url
            : `https://${company.url}`;
          const validatedUrl = new URL(fallbackUrl);
          window.open(validatedUrl.href, '_blank', 'noopener,noreferrer');
        } catch {
          console.error('Failed to open company URL:', company.url);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {title} ({companies.length})
          </DialogTitle>
          <DialogDescription>
            View company logos and visit their websites
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No companies found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map(company => {
                const logoUrl = getLogoUrl(company);

                return (
                  <div
                    key={company.id}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
                      company.url && 'cursor-pointer'
                    )}
                    onClick={() => handleCompanyClick(company)}
                  >
                    <div className="flex-shrink-0">
                      {logoUrl ? (
                        <div className="relative w-12 h-12 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                          <Image
                            src={logoUrl}
                            alt={`${company.name} logo`}
                            fill
                            className="object-contain"
                            onError={e => {
                              // Fallback to default icon if logo fails to load
                              e.target.style.display = 'none';
                              e.target.parentNode.querySelector(
                                '.fallback-icon'
                              ).style.display = 'block';
                            }}
                          />
                          <Building className="fallback-icon w-6 h-6 text-muted-foreground hidden" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-accent rounded-lg border flex items-center justify-center">
                          <Building className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">
                          {company.name}
                        </h3>
                        {company.url && (
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Click on a company to visit their website
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Company Badge with Logo Dialog Trigger
 * Use this component to display company badges that open the logos dialog when clicked
 */
export function CompanyBadgeWithDialog({
  companyIds,
  maxVisible = 3,
  variant = 'outline',
  className,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getCompanyFromCache } = useCompanyStore();

  if (!companyIds?.length) return null;

  const visibleCompanies = companyIds.slice(0, maxVisible);
  const remainingCount = companyIds.length - maxVisible;

  return (
    <>
      <div className={cn('flex flex-wrap gap-1', className)}>
        {visibleCompanies.map(companyId => {
          const company = getCompanyFromCache(companyId);
          return (
            <Badge
              key={companyId}
              variant={variant}
              className="text-xs cursor-pointer hover:bg-accent"
              onClick={e => {
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
            >
              {company?.name || 'Unknown'}
            </Badge>
          );
        })}

        {remainingCount > 0 && (
          <Badge
            variant={variant}
            className="text-xs cursor-pointer hover:bg-accent"
            onClick={e => {
              e.stopPropagation();
              setIsDialogOpen(true);
            }}
          >
            +{remainingCount} more
          </Badge>
        )}
      </div>

      <CompanyLogosDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyIds={companyIds}
      />
    </>
  );
}
