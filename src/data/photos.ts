// The photo beside each country page's heading, keyed by country code. pos is the CSS object-position that keeps both people
// in frame when the photo is cropped to the right half of a wide screen. A page without an entry shows no photo.
export const photos: Record<string, { src: string; alt: string; pos: string }> = {
  DE: { src: '/office-germany.jpg', alt: 'Two colleagues going through printed documents at a table in a bright office.', pos: '70% center' },
  FR: { src: '/office-france.jpg', alt: 'Two colleagues discussing a printed page at a round table by a tall window.', pos: '55% center' },
  BE: { src: '/office-belgium.jpg', alt: 'Two colleagues reviewing a page of figures at a long table in an office with a brick wall.', pos: '55% center' },
};
