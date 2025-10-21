/**
 * Marketplace Filtering and Search Utilities
 * Based on enstools marketplace filtering functionality
 */

const { parseEther } = require('ethers');

/**
 * Apply sorting to marketplace queries
 * @param {string} sortby - Field to sort by
 * @param {string} sortdirection - Sort direction (ASC/DESC)
 * @returns {string} SQL ORDER BY clause
 */
function applySortings(sortby, sortdirection = "ASC") {
  let sorts = "";

  if (sortby && sortby.trim() !== "") {
    sorts = sortby + " " + sortdirection;
  }

  return sorts;
}

/**
 * Apply filters to marketplace listings
 * @param {Object} filters - Filter criteria
 * @param {string} sortby - Sort field
 * @returns {string} SQL WHERE clause
 */
function applyListingFilters(filters, sortby = "") {
  let query = "";
  let value = "";

  if (filters["listing_index"] && filters["listing_index"] !== "") {
    value = filters["listing_index"].toLowerCase();
    query = query === "" ? "marketplace.listing_index = " + value : query + " AND marketplace.listing_index = " + value;
  }

  if (filters["creator"] && filters["creator"] !== "") {
    value = filters["creator"].toLowerCase();
    query =
      query === ""
        ? "marketplace.creator LIKE '" + value + "%'"
        : query + " AND marketplace.creator LIKE '" + value + "%'";
  }

  if (filters["token_id"] && filters["token_id"] !== "") {
    value = filters["token_id"];
    query =
      query === ""
        ? "marketplace.token_id LIKE '" + value + "%'"
        : query + " AND marketplace.token_id LIKE '" + value + "%'";
  }

  if (filters["buyer"] && filters["buyer"] !== "") {
    value = filters["buyer"].toLowerCase();
    query =
      query === "" ? "marketplace.buyer LIKE '" + value + "%'" : query + " AND marketplace.buyer LIKE '" + value + "%'";
  }

  if (filters["cancelled"] && filters["cancelled"] !== "") {
    value = filters["cancelled"];
    if (value === "true") {
      query =
        query === ""
          ? "marketplace.cancelled = '" + value + "'"
          : query + " AND marketplace.cancelled = '" + value + "'";
    } else {
      query = query === "" ? "marketplace.cancelled IS NULL" : query + " AND marketplace.cancelled IS NULL";
    }
  }

  if (filters["listing_until"] && filters["listing_until"] !== "") {
    value = filters["listing_until"];
    query =
      query === ""
        ? "marketplace.listing_until >= '" + value + "'"
        : query + " AND marketplace.listing_until >= '" + value + "'";
  }

  if (filters["selected_at"] && filters["selected_at"] !== "") {
    value = filters["selected_at"];
    query =
      query === ""
        ? "marketplace.selected_at >= '" + value + "'"
        : query + " AND marketplace.selected_at >= '" + value + "'";
  }

  return query;
}

/**
 * Apply filters to offchain marketplace listings
 * @param {Object} filters - Filter criteria
 * @param {string} sortby - Sort field
 * @returns {string} SQL WHERE clause
 */
function applyOffchainListingFilters(filters, sortby = "") {
  let query = "";
  let value = "";
  let tempquery = "";

  if (filters["listing_index"] && filters["listing_index"] !== "") {
    value = filters["listing_index"].toLowerCase();
    query =
      query === ""
        ? "marketplace_offchain.listing_index = " + value
        : query + " AND marketplace_offchain.listing_index = " + value;
  }

  if (filters["creator"] && filters["creator"] !== "") {
    value = filters["creator"].toLowerCase();
    query =
      query === ""
        ? "marketplace_offchain.creator LIKE '" + value + "%'"
        : query + " AND marketplace_offchain.creator LIKE '" + value + "%'";
  }

  if (filters["token_id"] && filters["token_id"] !== "") {
    value = filters["token_id"];
    query =
      query === ""
        ? "marketplace_offchain.token_id LIKE '" + value + "%'"
        : query + " AND marketplace_offchain.token_id LIKE '" + value + "%'";
  }

  if (filters["buyer"] && filters["buyer"] !== "") {
    value = filters["buyer"].toLowerCase();
    query =
      query === ""
        ? "marketplace_offchain.buyer LIKE '" + value + "%'"
        : query + " AND marketplace_offchain.buyer LIKE '" + value + "%'";
  }

  if (filters["cancelled"] && filters["cancelled"] !== "") {
    value = filters["cancelled"];
    if (value === "true") {
      query =
        query === ""
          ? "marketplace_offchain.cancelled = '" + value + "'"
          : query + " AND marketplace_offchain.cancelled = '" + value + "'";
    } else {
      query =
        query === "" ? "marketplace_offchain.cancelled IS NULL" : query + " AND marketplace_offchain.cancelled IS NULL";
    }
  } else {
    query =
      query === "" ? "marketplace_offchain.cancelled IS NULL" : query + " AND marketplace_offchain.cancelled IS NULL";
  }

  if (filters["listing_until"] && filters["listing_until"] !== "") {
    value = filters["listing_until"];
    query =
      query === ""
        ? "marketplace_offchain.listing_until >= " + value
        : query + " AND marketplace_offchain.listing_until >= " + value;
    // Non-finalised
    query = query + " AND marketplace_offchain.selected_at IS NULL";
  }

  // Finalised Listings
  if (filters["listing_until_end"] && filters["listing_until_end"] !== "") {
    value = filters["listing_until_end"];
    query =
      query === ""
        ? "marketplace_offchain.listing_until < " + value
        : query + " AND marketplace_offchain.listing_until < " + value;
    query =
      "(" + query + " OR marketplace_offchain.cancelled = 'true' OR marketplace_offchain.selected_at IS NOT NULL)";
  }

  if (filters["selected_at"] && filters["selected_at"] !== "") {
    value = filters["selected_at"];
    query =
      query === ""
        ? "marketplace_offchain.selected_at >= '" + value + "'"
        : query + " AND marketplace_offchain.selected_at >= '" + value + "'";
  }

  if (filters["price_min"] && filters["price_min"] !== "") {
    value = parseEther(filters["price_min"]).toString();
    query =
      query === "" ? "marketplace_offchain.price >= " + value : query + " AND marketplace_offchain.price >= " + value;
  }

  if (filters["price_max"] && filters["price_max"] !== "") {
    value = parseEther(filters["price_max"]).toString();
    query =
      query === "" ? "marketplace_offchain.price <= " + value : query + " AND marketplace_offchain.price <= " + value;
  }

  if (filters["starts_with"] && filters["starts_with"] !== "") {
    value = filters["starts_with"];
    query = query === "" ? "domains.name LIKE '" + value + "%'" : query + " AND domains.name LIKE '" + value + "%'";
  }

  if (filters["ends_with"] && filters["ends_with"] !== "") {
    value = filters["ends_with"];
    query = query === "" ? "domains.name LIKE '%" + value + "'" : query + " AND domains.name LIKE '%" + value + "'";
  }

  if (filters["letters"] && filters["letters"] !== "") {
    value = filters["letters"];
    tempquery = translateBoolean("is_letters", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  if (filters["numbers"] && filters["numbers"] !== "") {
    value = filters["numbers"];
    tempquery = translateSelect("is_numbers", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  if (filters["unicode"] && filters["unicode"] !== "") {
    value = filters["unicode"];
    tempquery = translateBoolean("is_unicode", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  if (filters["emojis"] && filters["emojis"] !== "") {
    value = filters["emojis"];
    tempquery = translateBoolean("is_emoji", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  return query;
}

/**
 * Apply filters to auction listings
 * @param {Object} filters - Filter criteria
 * @param {string} sortby - Sort field
 * @returns {string} SQL WHERE clause
 */
function applyAuctionFilters(filters, sortby = "") {
  let query = "";
  let value = "";

  if (filters["auction_index"] && filters["auction_index"] !== "") {
    value = filters["auction_index"].toLowerCase();
    query = query === "" ? "marketplace.auction_index = " + value : query + " AND marketplace.auction_index = " + value;
  }

  if (filters["creator"] && filters["creator"] !== "") {
    value = filters["creator"].toLowerCase();
    query =
      query === ""
        ? "marketplace.creator LIKE '" + value + "%'"
        : query + " AND marketplace.creator LIKE '" + value + "%'";
  }

  if (filters["token_id"] && filters["token_id"] !== "") {
    value = filters["token_id"];
    query =
      query === ""
        ? "marketplace.token_id LIKE '" + value + "%'"
        : query + " AND marketplace.token_id LIKE '" + value + "%'";
  }

  if (filters["buyer"] && filters["buyer"] !== "") {
    value = filters["buyer"].toLowerCase();
    query = query === "" ? "marketplace.buyer LIKE '" + value + "%'" : query + " AND marketplace.buyer LIKE '" + value + "%'";
  }

  if (filters["cancelled"] && filters["cancelled"] !== "") {
    value = filters["cancelled"];
    if (value === "true") {
      query =
        query === ""
          ? "marketplace.cancelled = '" + value + "'"
          : query + " AND marketplace.cancelled = '" + value + "'";
    } else {
      query = query === "" ? "marketplace.cancelled IS NULL" : query + " AND marketplace.cancelled IS NULL";
    }
  }

  if (filters["auction_until"] && filters["auction_until"] !== "") {
    value = filters["auction_until"];
    query =
      query === ""
        ? "marketplace.auction_until >= '" + value + "'"
        : query + " AND marketplace.auction_until >= '" + value + "'";
  }

  if (filters["selected_at"] && filters["selected_at"] !== "") {
    value = filters["selected_at"];
    query =
      query === ""
        ? "marketplace.selected_at >= '" + value + "'"
        : query + " AND marketplace.selected_at >= '" + value + "'";
  }

  return query;
}

/**
 * Apply filters to offchain auction listings
 * @param {Object} filters - Filter criteria
 * @param {string} sortby - Sort field
 * @returns {string} SQL WHERE clause
 */
function applyOffchainAuctionFilters(filters, sortby = "") {
  let query = "";
  let value = "";
  let tempquery = "";

  if (filters["auction_index"] && filters["auction_index"] !== "") {
    value = filters["auction_index"].toLowerCase();
    query = query === "" ? "auctions.auction_index = " + value : query + " AND auctions.auction_index = " + value;
  }

  if (filters["creator"] && filters["creator"] !== "") {
    value = filters["creator"].toLowerCase();
    query =
      query === "" ? "auctions.creator LIKE '" + value + "%'" : query + " AND auctions.creator LIKE '" + value + "%'";
  }

  if (filters["token_id"] && filters["token_id"] !== "") {
    value = filters["token_id"];
    query =
      query === "" ? "auctions.token_id LIKE '" + value + "%'" : query + " AND auctions.token_id LIKE '" + value + "%'";
  }

  if (filters["buyer"] && filters["buyer"] !== "") {
    value = filters["buyer"].toLowerCase();
    query = query === "" ? "auctions.buyer LIKE '" + value + "%'" : query + " AND auctions.buyer LIKE '" + value + "%'";
  }

  if (filters["cancelled"] && filters["cancelled"] !== "") {
    value = filters["cancelled"];
    if (value === "true") {
      query =
        query === "" ? "auctions.cancelled = '" + value + "'" : query + " AND auctions.cancelled = '" + value + "'";
    } else {
      query = query === "" ? "auctions.cancelled IS NULL" : query + " AND auctions.cancelled IS NULL";
    }
  } else {
    query = query === "" ? "auctions.cancelled IS NULL" : query + " AND auctions.cancelled IS NULL";
  }

  if (filters["auction_until"] && filters["auction_until"] !== "") {
    value = filters["auction_until"];
    query = query === "" ? "auctions.auction_until >= " + value : query + " AND auctions.auction_until >= " + value;
    // Non-finalised
    query = query + " AND auctions.selected_at IS NULL";
  }

  // Finalised Listings
  if (filters["auction_until_end"] && filters["auction_until_end"] !== "") {
    value = filters["auction_until_end"];
    query = query === "" ? "auctions.auction_until < " + value : query + " AND auctions.auction_until < " + value;
    query = "(" + query + " OR auctions.cancelled = 'true' OR auctions.selected_at IS NOT NULL)";
  }

  if (filters["selected_at"] && filters["selected_at"] !== "") {
    value = filters["selected_at"];
    query =
      query === "" ? "auctions.selected_at >= '" + value + "'" : query + " AND auctions.selected_at >= '" + value + "'";
  }

  if (filters["price_min"] && filters["price_min"] !== "") {
    value = parseEther(filters["price_min"]).toString();
    query = query === "" ? "auctions.price >= " + value : query + " AND auctions.price >= " + value;
  }

  if (filters["price_max"] && filters["price_max"] !== "") {
    value = parseEther(filters["price_max"]).toString();
    query = query === "" ? "auctions.price <= " + value : query + " AND auctions.price <= " + value;
  }

  if (filters["starts_with"] && filters["starts_with"] !== "") {
    value = filters["starts_with"];
    query = query === "" ? "domains.name LIKE '" + value + "%'" : query + " AND domains.name LIKE '" + value + "%'";
  }

  if (filters["ends_with"] && filters["ends_with"] !== "") {
    value = filters["ends_with"];
    query = query === "" ? "domains.name LIKE '%" + value + "'" : query + " AND domains.name LIKE '%" + value + "'";
  }

  if (filters["letters"] && filters["letters"] !== "") {
    value = filters["letters"];
    tempquery = translateBoolean("is_letters", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  if (filters["numbers"] && filters["numbers"] !== "") {
    value = filters["numbers"];
    tempquery = translateSelect("is_numbers", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  if (filters["unicode"] && filters["unicode"] !== "") {
    value = filters["unicode"];
    tempquery = translateBoolean("is_unicode", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  if (filters["emojis"] && filters["emojis"] !== "") {
    value = filters["emojis"];
    tempquery = translateBoolean("is_emoji", value);
    query = query === "" ? tempquery : query + " AND " + tempquery;
  }

  return query;
}

/**
 * Apply filters to offer listings
 * @param {Object} filters - Filter criteria
 * @param {string} sortby - Sort field
 * @returns {string} SQL WHERE clause
 */
function applyOfferFilters(filters, sortby = "") {
  let query = "";
  let value = "";

  if (filters["offer_index"] && filters["offer_index"] !== "") {
    value = filters["offer_index"].toLowerCase();
    query = query === "" ? "offers.offer_index = " + value : query + " AND offers.offer_index = " + value;
  }

  if (filters["domain_owner"] && filters["domain_owner"] !== "") {
    value = filters["domain_owner"].toLowerCase();
    query =
      query === ""
        ? "offers.domain_owner LIKE '" + value + "%'"
        : query + " AND offers.domain_owner LIKE '" + value + "%'";
  }

  if (filters["offer_maker"] && filters["offer_maker"] !== "") {
    value = filters["offer_maker"].toLowerCase();
    query =
      query === ""
        ? "offers.offer_maker LIKE '" + value + "%'"
        : query + " AND offers.offer_maker LIKE '" + value + "%'";
  }

  if (filters["token_id"] && filters["token_id"] !== "") {
    value = filters["token_id"];
    query =
      query === ""
        ? "offers.token_id LIKE '" + value + "%'"
        : query + " AND offers.token_id LIKE '" + value + "%'";
  }

  if (filters["cancelled"] && filters["cancelled"] !== "") {
    value = filters["cancelled"];
    if (value === "true") {
      query =
        query === ""
          ? "offers.cancelled = '" + value + "'"
          : query + " AND offers.cancelled = '" + value + "'";
    } else {
      query = query === "" ? "offers.cancelled IS NULL" : query + " AND offers.cancelled IS NULL";
    }
  } else {
    query = query === "" ? "offers.cancelled IS NULL" : query + " AND offers.cancelled IS NULL";
  }

  if (filters["offer_until"] && filters["offer_until"] !== "") {
    value = filters["offer_until"];
    query = query === "" ? "offers.offer_until >= " + value : query + " AND offers.offer_until >= " + value;
    // Non-finalised
    query = query + " AND offers.selected_at IS NULL";
  }

  if (filters["selected_at"] && filters["selected_at"] !== "") {
    value = filters["selected_at"];
    query =
      query === "" ? "offers.selected_at >= '" + value + "'" : query + " AND offers.selected_at >= '" + value + "'";
  }

  if (filters["price_min"] && filters["price_min"] !== "") {
    value = parseEther(filters["price_min"]).toString();
    query = query === "" ? "offers.price >= " + value : query + " AND offers.price >= " + value;
  }

  if (filters["price_max"] && filters["price_max"] !== "") {
    value = parseEther(filters["price_max"]).toString();
    query = query === "" ? "offers.price <= " + value : query + " AND offers.price <= " + value;
  }

  return query;
}

/**
 * Translate boolean filter values
 * @param {string} field - Field name
 * @param {string} value - Boolean value
 * @returns {string} SQL condition
 */
function translateBoolean(field, value) {
  if (value === "true") {
    return field + " = true";
  } else if (value === "false") {
    return field + " = false";
  }
  return "";
}

/**
 * Translate select filter values
 * @param {string} field - Field name
 * @param {string} value - Select value
 * @returns {string} SQL condition
 */
function translateSelect(field, value) {
  if (value === "yes") {
    return field + " = true";
  } else if (value === "no") {
    return field + " = false";
  }
  return "";
}

/**
 * Build complete marketplace query with filters and sorting
 * @param {Object} filters - Filter criteria
 * @param {string} sortby - Sort field
 * @param {string} sortdirection - Sort direction
 * @param {string} table - Table name (listings, auctions, offers)
 * @param {boolean} offchain - Whether to use offchain filters
 * @returns {Object} Query object with where and orderBy clauses
 */
function buildMarketplaceQuery(filters, sortby, sortdirection, table, offchain = false) {
  let whereClause = "";
  let orderByClause = "";

  // Apply appropriate filters based on table and offchain flag
  switch (table) {
    case "listings":
      whereClause = offchain ? applyOffchainListingFilters(filters, sortby) : applyListingFilters(filters, sortby);
      break;
    case "auctions":
      whereClause = offchain ? applyOffchainAuctionFilters(filters, sortby) : applyAuctionFilters(filters, sortby);
      break;
    case "offers":
      whereClause = applyOfferFilters(filters, sortby);
      break;
    default:
      whereClause = "";
  }

  // Apply sorting
  orderByClause = applySortings(sortby, sortdirection);

  return {
    where: whereClause,
    orderBy: orderByClause
  };
}

module.exports = {
  applySortings,
  applyListingFilters,
  applyOffchainListingFilters,
  applyAuctionFilters,
  applyOffchainAuctionFilters,
  applyOfferFilters,
  translateBoolean,
  translateSelect,
  buildMarketplaceQuery
};
