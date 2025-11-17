import React from 'react';

interface OriginalSource {
  platform: 'Wikibooks';
  url: string;
  pageTitle: string;
  license: 'CC BY-SA 4.0';
  licenseUrl: string;
  originalCreator?: {
    name: string;
    userPageUrl: string;
  };
  contributorsUrl?: string;
  extractedAt?: string | Date;
}

interface OriginalImage {
  author?: {
    name: string;
    userPageUrl: string;
  };
  license?: {
    code: string;
    shortName: string;
    fullName: string;
    url: string;
  };
  wikimediaCommonsUrl?: string;
}

interface WikibooksDisclaimerProps {
  originalSource?: OriginalSource | null;
  originalImage?: OriginalImage | null;
}

export default function WikibooksDisclaimer({
  originalSource,
  originalImage,
}: WikibooksDisclaimerProps) {
  // Only show if this is a Wikibooks recipe
  if (!originalSource || originalSource.platform !== 'Wikibooks') {
    return null;
  }

  // Helper function to render author name with truncation logic
  const renderAuthorName = (name: string | undefined, userPageUrl: string | undefined) => {
    if (!name && !userPageUrl) {
      return null;
    }

    // If name is longer than 50 characters or name doesn't exist but URL does
    if (!name || name.length > 50) {
      if (userPageUrl) {
        return (
          <a
            href={userPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Nuotraukos autorius
          </a>
        );
      }
      return null;
    }

    // Name is short enough, show it with link
    return (
      <>
        {name}
        {userPageUrl && (
          <>
            {' '}
            <a
              href={userPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              (profilis)
            </a>
          </>
        )}
      </>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="text-sm text-gray-700 space-y-2">
        {/* Main disclaimer text */}
        <p>
          Šis receptas yra lietuviška originalaus Wikibooks turinio versija. Tekste atlikti
          vertimo ir redakciniai pakeitimai.
        </p>

        {/* Recipe author and contributors */}
        {originalSource.originalCreator && (
          <p>
            Recepto autorius: {originalSource.originalCreator.name}
            {originalSource.contributorsUrl && (
              <>
                {' '}
                ir{' '}
                <a
                  href={originalSource.contributorsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  bendraautoriai
                </a>
              </>
            )}
          </p>
        )}

        {/* Source URL */}
        {originalSource.url && (
          <p>
            Šaltinis:{' '}
            <a
              href={originalSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Wikibooks
            </a>
          </p>
        )}

        {/* License information */}
        <p>
          Turinys licencijuotas pagal Creative Commons Attribution-ShareAlike (CC BY-SA 4.0)
          licenciją{' '}
          <a
            href={originalSource.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {originalSource.licenseUrl}
          </a>
          . Naudojant šį turinį, būtina nurodyti autorių, pateikti nuorodą į licenciją ir
          laikytis jos reikalavimų.
        </p>

        {/* Image attribution */}
        {originalImage && (
          <>
            <p>
              Nuotrauka: {renderAuthorName(originalImage.author?.name, originalImage.author?.userPageUrl)}
            </p>

            {originalImage.wikimediaCommonsUrl && (
              <p>
                Šaltinis: Wikimedia Commons (
                <a
                  href={originalImage.wikimediaCommonsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {originalImage.wikimediaCommonsUrl}
                </a>
                )
              </p>
            )}

            {originalImage.license && (
              <p>
                Licencija: {originalImage.license.shortName}
                {originalImage.license.url && (
                  <>
                    {' '}
                    <a
                      href={originalImage.license.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {originalImage.license.url}
                    </a>
                  </>
                )}
              </p>
            )}

            <p>Nuotrauka buvo optimizuota (suspausti dydis, konvertavimas į WebP/AVIF formatą).</p>
          </>
        )}

        {/* Additional info link */}
        <p>
          Daugiau informacijos:{' '}
          <a
            href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use
          </a>
        </p>
      </div>
    </div>
  );
}

