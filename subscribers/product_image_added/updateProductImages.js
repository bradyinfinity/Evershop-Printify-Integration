const { update } = require('@evershop/postgres-query-builder');
const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const { error, debug } = require('@evershop/evershop/src/lib/log/logger');

module.exports = async function updateProductImages(data) {
  try {
    // Extract the original blob URL from the data object
    const originalBlobUrl = data.origin_image;

    // Only process if the URL is from 'images.printify.com'
    const url = new URL(originalBlobUrl);
    if (url.hostname === 'images.printify.com') {
      const singleImageUrl = new URL(originalBlobUrl);
      const listingImageUrl = new URL(originalBlobUrl);
      const thumbImageUrl = new URL(originalBlobUrl);
      
      // Set `s=400` for single and listing images
      singleImageUrl.searchParams.set('s', '400');
      listingImageUrl.searchParams.set('s', '400');

      // Set `s=100` for thumbnail image
      thumbImageUrl.searchParams.set('s', '100');

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the record in the database with the new URLs in the variant columns
      const update_result = await update('product_image')
        .given({
          single_image: singleImageUrl.toString(), // Updated single image
          listing_image: listingImageUrl.toString(), // Updated listing image
          thumb_image: thumbImageUrl.toString(), // Updated thumbnail image
        })
        .where('product_image_product_id', '=', data.product_image_product_id)
        .and('origin_image', '=', originalBlobUrl)
        .execute(pool);

      debug(update_result);
    } else {
      debug('Skipping image update as the origin is not from images.printify.com');
    }
  } catch (e) {
    error('Error updating thumbnail images in the database:', e);
  }
}
