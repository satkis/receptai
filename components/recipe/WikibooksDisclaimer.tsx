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
<<<<<<< HEAD
            className="text-blue-600 underline hover:text-blue-800"
=======
            className="text-gray-500 hover:text-gray-700"
>>>>>>> develop
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
<<<<<<< HEAD
              className="text-blue-600 underline hover:text-blue-800"
=======
              className="text-gray-500 hover:text-gray-700"
>>>>>>> develop
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
<<<<<<< HEAD
            Recepto autorius: {originalSource.originalCreator.name}
=======
            Recepto autorius:{' '}
            <a
              href={originalSource.originalCreator.userPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              {originalSource.originalCreator.name}
            </a>
>>>>>>> develop
            {originalSource.contributorsUrl && (
              <>
                {' '}
                ir{' '}
                <a
                  href={originalSource.contributorsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
<<<<<<< HEAD
                  className="text-blue-600 underline hover:text-blue-800"
=======
                  className="text-gray-500 hover:text-gray-700"
>>>>>>> develop
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
<<<<<<< HEAD
              className="text-blue-600 underline hover:text-blue-800"
=======
              className="text-gray-500 hover:text-gray-700"
>>>>>>> develop
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
<<<<<<< HEAD
            className="text-blue-600 underline hover:text-blue-800"
=======
            className="text-gray-500 hover:text-gray-700"
>>>>>>> develop
          >
            {originalSource.licenseUrl}
          </a>
          . Naudojant šį turinį, būtina nurodyti autorių, pateikti nuorodą į licenciją ir
          laikytis jos reikalavimų.
        </p>

        {/* Image attribution */}
        {originalImage && (
          <>
<<<<<<< HEAD
            <p>
              Nuotrauka: {renderAuthorName(originalImage.author?.name, originalImage.author?.userPageUrl)}
            </p>

            {originalImage.wikimediaCommonsUrl && (
              <p>
                Šaltinis: Wikimedia Commons (
=======
            {/* Only show "Nuotrauka:" line if author name is <= 50 chars */}
            {originalImage.author?.name && originalImage.author.name.length <= 50 && (
              <p>
                Nuotrauka: {renderAuthorName(originalImage.author?.name, originalImage.author?.userPageUrl)}
              </p>
            )}

            {/* If author name > 50 chars, show only the clickable link without "Nuotrauka:" prefix */}
            {originalImage.author?.name && originalImage.author.name.length > 50 && (
              <p>
                {renderAuthorName(originalImage.author?.name, originalImage.author?.userPageUrl)}
              </p>
            )}

            {/* Wikimedia Commons source - URL behind the text */}
            {originalImage.wikimediaCommonsUrl && (
              <p>
                Šaltinis:{' '}
>>>>>>> develop
                <a
                  href={originalImage.wikimediaCommonsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
<<<<<<< HEAD
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
=======
                  className="text-gray-500 hover:text-gray-700"
                >
                  Wikimedia Commons
                </a>
              </p>
            )}

            {/* License - URL behind the license name */}
            {originalImage.license && (
              <p>
                Licencija:{' '}
                {originalImage.license.url ? (
                  <a
                    href={originalImage.license.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {originalImage.license.shortName}
                  </a>
                ) : (
                  originalImage.license.shortName
>>>>>>> develop
                )}
              </p>
            )}

<<<<<<< HEAD
            <p>Nuotrauka buvo optimizuota (suspausti dydis, konvertavimas į WebP/AVIF formatą).</p>
=======
            {/* Image optimization note */}
            <p>Nuotrauka dydis buvo optimizuotas bei konvertuotas formatas.</p>
>>>>>>> develop
          </>
        )}

        {/* Additional info link */}
        <p>
<<<<<<< HEAD
          Daugiau informacijos:{' '}
=======
          Daugiau informacijos{' '}
>>>>>>> develop
          <a
            href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use"
            target="_blank"
            rel="noopener noreferrer"
<<<<<<< HEAD
            className="text-blue-600 underline hover:text-blue-800"
          >
            https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use
=======
            className="text-gray-500 hover:text-gray-700"
          >
            čia
>>>>>>> develop
          </a>
        </p>
      </div>
    </div>
  );
}

