/* 
 * Package: response.js
 * 
 * Namespace: bbop.golr.response
 * 
 * Generic BBOP handler for dealing with the gross parsing of
 * responses from a GOlr server (whereas <golr_conf> deals with the
 * reported configuration). This is not intended to do anything like
 * modeling the data in the store (<golr_manager>), but rather to deal
 * with things like checking for success, what paging would look like,
 * what parameters were passed, etc.
 */

var bbop = require('bbop-core');
var us = require('underscore');

var bbop_rest_response = require('bbop-rest-response');

/*
 * Constructor: response
 * 
 * Contructor for a GOlr query response object.
 * 
 * The constructor argument is an object, not a string.
 * 
 * Arguments:
 *  json_data - the JSON data (as object) returned from a request
 * 
 * Returns:
 *  golr response object
 */
var response = function(json_data){
    bbop_rest_response.json.call(this, json_data);
    //console.log('_is_a', this._is_a);
    this._is_a = 'bbop-response-golr';
    //console.log('_is_a', this._is_a);

    // The setting of:
    //   this._raw (as JSON)
    //   this._raw_string (incoming arg)
    //   this._okay (parsability)
    // are left to the superclass.

    // Cache for repeated calls to success().
    this._success = null;

    // Cache for repeated calls to get_doc* functions.
    // These are non-incremental indices--they are either full formed
    // (the first time they are hit) or they are null.
    this._doc_id2index = null;
    this._doc_index2_id = null;

    // Cache for repeated calls to resolve labels.
    // This cache is incremental--the more it's used the larger it gets.
    this._doc_label_maps = {}; // {<field_1>: <parsed_json_map_1>, ...}

    // For highlight stripping, I just want to compile this once.
    this._hl_regexp = new RegExp("\<\[\^\>\]\*\>", "g");

};
bbop.extend(response, bbop_rest_response.json);

/*
 * Function: raw
 * 
 * returns a pointer to the initial response object
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  object
 */
response.prototype.raw = function(){
    return this._raw;
};

/*
 * Function: success
 * 
 * Simple return verification of sane response from server.
 * 
 * Success caches its return value.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
response.prototype.success = function(){

    if( this._success === null ){

	var robj = this._raw;
	if( robj &&
	    robj.responseHeader &&
	    typeof robj.responseHeader.status !== 'undefined' &&
	    robj.responseHeader.status === 0 &&
	    robj.responseHeader.params &&
	    robj.response &&
	    typeof robj.response.numFound !== 'undefined' &&
	    typeof robj.response.start !== 'undefined' &&
	    typeof robj.response.maxScore !== 'undefined' &&
	    robj.response.docs &&
	    robj.facet_counts &&
	    robj.facet_counts.facet_fields ){
		this._success = true;
	    }else{
		this._success = false;
	    }
    }

    return this._success;
};

/*
 * Function: okay
 * 
 * Alias for <success>.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
response.prototype.okay = function(){
    return this.success();
};

/*
 * Function: callback_type
 * 
 * Return the callback type if it was specified in the query,
 * otherwise return null. For example "reset" and "response".
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  string (or null)
 */
response.prototype.callback_type = function(){
    var robj = this._raw;
    var retval = null;
    if( robj.responseHeader.params.callback_type &&
	typeof robj.responseHeader.params.callback_type !== 'undefined' ){
	    retval = robj.responseHeader.params.callback_type;
	}
    return retval;
};

/*
 * Function: parameters
 * 
 * Get the parameter chunk--variable stuff we put in.
 * 
 * Pretty general, specialized functions are better.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash
 */
response.prototype.parameters = function(){
    var robj = this._raw;
    return robj.responseHeader.params;
};

/*
 * Function: parameter
 * 
 * Get the parameter chunk--variable stuff we put in.
 * 
 * Pretty general, specialized functions are better.
 * 
 * Arguments:
 *  n/a
 *  key - string id for the wanted parameter
 * 
 * Returns:
 *  hash, string, whatever is there at that key (otherwise null)
 */
response.prototype.parameter = function(key){
    var robj = this._raw;
    var retval = null;
    if( robj.responseHeader.params[key] && robj.responseHeader.params[key] ){
	retval = robj.responseHeader.params[key];
    }
    return retval;
};

/*
 * Function: row_step
 * 
 * Returns the number of rows requested (integer).
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
response.prototype.row_step = function(){	
    var robj = this._raw;
    return parseInt(robj.responseHeader.params.rows);
};

/*
 * Function: total_documents
 * 
 * Return the total number of documents found.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
response.prototype.total_documents = function(){
    var robj = this._raw;
    return parseInt(robj.response.numFound);
};

/*
 * Function: start_document
 * 
 * Returns the start document for this response as an integer.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
response.prototype.start_document = function(){
    var robj = this._raw;
    return parseInt(robj.response.start) + 1;
};

/*
 * Function: end_document
 * 
 * Returns the end document for this response as an integer.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer
 */
response.prototype.end_document = function(){
    var robj = this._raw;
    return this.start_document() +
	parseInt(robj.response.docs.length) - 1;
};

/*
 * Function: packet
 * 
 * Return the packet number of the current response.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  integer or null (no packet defined)
 */
response.prototype.packet = function(){
    var robj = this._raw;
    var retval = null;
    var pval = robj.responseHeader.params.packet;
    if( pval ){
	retval = parseInt(pval);
    }
    return retval;
};

/*
 * Function: paging_p
 * 
 * Whether or not paging is necessary with the given results set.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
response.prototype.paging_p = function(){
    var robj = this._raw;
    var retval = false;
    if( this.total_documents() > this.row_step() ){
	retval = true;
    }
    return retval;
};

/*
 * Function: paging_previous_p
 * 
 * Whether or paging backwards is an option right now.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
response.prototype.paging_previous_p = function(){
    // We'll take this as a proxy that a step was taken.
    // Remember: we offset the start_document by one for readability.
    var robj = this._raw;
    var retval = false;
    if( this.start_document() > 1 ){
	retval = true;
    }
    return retval;
};

/*
 * Function: paging_next_p
 * 
 * Whether or paging forwards is an option right now.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  boolean
 */
response.prototype.paging_next_p = function(){
    // We'll take this as a proxy that a step was taken.
    var robj = this._raw;
    var retval = false;
    if( this.total_documents() > this.end_document() ){
	retval = true;	
    }
    return retval;
};

/*
 * Function: documents
 * 
 * Returns an array of raw and unprocessed document hashes.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash
 */
response.prototype.documents = function(){
    var robj = this._raw;
    return robj.response.docs;
};

/*
 * Function: highlighted_documents
 * 
 * Returns an array of raw and unprocessed document hashes.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash
 */
response.prototype.highlighted_documents = function(){
    var robj = this._raw;

    var zipped = us.zip(robj.response.docs, us.values(robj.highlighting));
    var hl = us.map(zipped, function(tuple) {
        var json = tuple[0];
        var highlight = tuple[1];

        return us.mapObject(json, function(val, key) {
            if(highlight[key] != null) {
                return highlight[key];
            } else {
                return val;
            }
        });
     });

    return hl;
};

/*
 * Function: get_doc
 * 
 * Returns a specified document, in its raw hash form.
 * 
 * Arguments:
 *  doc_id - document identifier either an id (first) or place in the array
 * 
 * Returns:
 *  document hash or null
 */
response.prototype.get_doc = function(doc_id){

    var doc = null;
    var robj = this._raw;

    // First check if the document is available by position.
    var docs = robj.response.docs;
    if( docs && docs[doc_id] ){
	doc = docs[doc_id];
    }else{ // Not available by position, so lets see if we can get it by id.
	
	//console.log('in: ' + doc_id + ' _' + this._doc_id2index);

	// Build the doc index if it isn't there.
	var local_anchor = this;
	if( ! this._doc_id2index ){
	    //console.log('BUILD triggered on: ' + doc_id);
	    this._doc_id2index = {};
	    this._doc_index2id = {};
	    us.each(docs, function(doc_item, doc_index){
		var did = doc_item['id'];
		//console.log('BUILD: ' + did + ' => ' + doc_index);
		local_anchor._doc_id2index[did] = doc_index;
		local_anchor._doc_index2id[doc_index] = did;
	    });
	}
	
	//console.log('pre-probe: ' + doc_id + ' _' + this._doc_id2index);

	// Try and probe it out.
	if( this._doc_id2index &&
	    typeof(this._doc_id2index[doc_id]) !== 'undefined' ){
		//console.log('PROBE: ' + doc_id);
		var doc_i = this._doc_id2index[doc_id];
		doc = docs[doc_i];
	    }
    }

    return doc;
};

/*
 * Function: get_doc_field
 * 
 * Returns the value(s) of the requested fields.
 * 
 * Remember that determining whether the returned value is a string or
 * a list is left as an exercise for the reader when using this
 * function.
 * 
 * Arguments:
 *  doc_id - document identifier either an id (first) or place in the array
 *  field_id - the identifier of the field we're trying to pull
 * 
 * Returns:
 *  value or list of values
 */
response.prototype.get_doc_field = function(doc_id, field_id){

    var ret = null;

    // If we found our doc, go ahead and start looking for the field.
    var doc = this.get_doc(doc_id);
    if( doc && typeof(doc[field_id]) !== 'undefined' ){
	
	// We have an answer with this.
	ret = doc[field_id];
    }

    return ret;
};

/*
 * Function: get_doc_label
 * 
 * Tries to return a label for a document, field, and id combination.
 * 
 * WARNING: This function could be potentially slow on large datasets.
 * 
 * Arguments:
 *  doc_id - document identifier either an id (first) or place in the array
 *  field_id - the identifier of the field we're trying to pull
 *  item_id - *[optional]* the item identifier that we're trying to resolve; if the field in question is a string or a single-valued list (as opposed to a multi-values list), this argument is not necessary, but it wouldn't hurt either
 * 
 * Returns:
 *  null (not found) or string
 */
response.prototype.get_doc_label = function(doc_id,field_id,item_id){

    var retval = null;

    var anchor = this;

    // If we found our doc, and confirmed that the field in question
    // exists in the doc, go ahead and start digging to resolve the id.
    var doc = this.get_doc(doc_id);
    if( doc && typeof(doc[field_id]) !== 'undefined' ){
	
	// First try the '_label' extension.
	var ilabel = this.get_doc_field(doc_id, field_id + '_label');

	if( ilabel && bbop.what_is(ilabel) === 'string' ){
	    // It looks like the simple solution.
	    //console.log('trivial hit');
	    retval = ilabel; // Hit!
	}else if( ilabel && bbop.what_is(ilabel) === 'array' ){
	    
	    // Well, it's multi-valued, but id might just be the one.
	    var iid = this.get_doc_field(doc_id, field_id);
	    if( ilabel.length === 1 && iid &&
		bbop.what_is(iid) === 'array' &&
		iid.length === 1 ){
		    // Case of a single id trivially mapping to a
		    // single label.
		    //console.log('forced hit');
		    retval = ilabel[0]; // Hit!
		}else{

		    //console.log('need to probe');

		    // Since we'll do this twice with different map
		    // fields, a generic function to try and probe a JSON
		    // string map (caching it along the way) for a label.
		    var _map_to_try = function(doc_key, map_field, item_key){

			var retlbl = null;

			var map_str = anchor.get_doc_field(doc_key, map_field);

			if( map_str && bbop.what_is(map_str) === 'string' ){

			    // First, check the cache. If it's not there
			    // add it.
			    if( typeof(anchor._doc_label_maps[doc_key]) ===  'undefined'){
				anchor._doc_label_maps[doc_key] = {};
			    }
			    if( typeof(anchor._doc_label_maps[doc_key][map_field]) === 'undefined'){
				// It looks like a map wasn't defined, so let's
				// convert it into JSON now.
				anchor._doc_label_maps[doc_key][map_field] =
				    JSON.parse(map_str);
			    }

			    // Pull our map out of the cache.
			    var map = anchor._doc_label_maps[doc_key][map_field];

			    // Probe to see if we have anything in the map.
			    if( map && map[item_key] ){
				retlbl = map[item_key];
			    }
			}

			return retlbl;
		    };

		    // Well, now we know that either we have to find a map
		    // or the information isn't there. First try the
		    // standard "_map".
		    var mlabel = _map_to_try(doc_id, field_id + '_map', item_id);
		    if( mlabel ){
			//console.log('map hit');
			retval = mlabel; // Hit!
		    }else{
			// If that didn't work, try again with
			// "_closure_map".
			var cmlabel =
				_map_to_try(doc_id, field_id + '_closure_map', item_id);
			if( cmlabel ){
			    //console.log('closure map hit');
			    retval = cmlabel; // Hit!
			}else{
			    // If that didn't work, try again with
			    // "_list_map".
			    var lmlabel =
				    _map_to_try(doc_id, field_id +'_list_map', item_id);
			    if( lmlabel ){
				//console.log('list map hit');
				retval = lmlabel; // Hit!
			    }
			}
		    }
		}
	}
    }

    return retval;
};

/*
 * Function: get_doc_highlight
 * 
 * Returns the highlighted value(s) of the requested fields.
 * 
 * WARNING: This function is a work in progress and will not return
 * multi-valued fields, just the first match it finds.
 * 
 * WARNING: This function could be potentially slow on large datasets.
 * 
 * Arguments:
 *  doc_id - document id
 *  field_id - the identifier of the field we're trying to pull
 *  item - the item that we're looking for the highlighted HTML for
 * 
 * Returns:
 *  string of highlight or null if nothing was found
 */
response.prototype.get_doc_highlight = function(doc_id,field_id,item){

    var ret = null;
    var robj = this._raw;
    var hlre = this._hl_regexp;

    // See if we can find a highlighted version in the raw
    // response. First, see if the document is in the hilight section;
    // otherwise try and pull the id out first, then head for the
    // highlight section.
    var hilite_obj = null;
    if( robj.highlighting && robj.highlighting[doc_id] ){
	hilite_obj = robj.highlighting[doc_id];
    }else{
	var iid = this._doc_index2id[doc_id];
	if( iid ){
	    var new_doc = this.get_doc(iid);
	    var new_doc_id = new_doc['id'];
	    if( robj.highlighting && robj.highlighting[new_doc_id] ){
		hilite_obj = robj.highlighting[new_doc_id];
	    }
	}
    }

    // If we got a highlight object, see if the highlighted field is
    // there--search the different possibilities for what a highlight
    // field may be called.
    if( hilite_obj ){
	
	//console.log('here (field_id): ' + field_id);

	var ans = null;

	if( hilite_obj[field_id + '_label_searchable'] ){
	    ans = hilite_obj[field_id + '_label_searchable'];
	}

	if( ! ans ){
	    if( hilite_obj[field_id + '_label'] ){
		ans = hilite_obj[field_id + '_label'];
	    }	    
	}

	if( ! ans ){
	    if( hilite_obj[field_id + '_searchable'] ){
		ans = hilite_obj[field_id + '_searchable'];
	    }
	}

	if( ! ans ){
	    if( hilite_obj[field_id] ){
		//console.log('here (field_id): ' + field_id);
		ans = hilite_obj[field_id];
	    }
	}

	if( ans ){ // looks like I found a list of something

	    // Use only the first match.
	    var matches_p = false;
	    us.each(ans, function(an){
		if( ! matches_p ){
		    var stripped = an.replace(hlre, '');
		    //console.log('stripped: ' + stripped);
		    //console.log('item: ' + item);
		    if( item === stripped ){
			matches_p = true;
			ret = an;
		    }
		}
	    });
	}
    }

    return ret;
};

// /*
//  * Function: facet_fields
//  * 
//  * Return a count sorted array of the response's facet fields and counts.
//  * 
//  * Arguments:
//  *  n/a
//  * 
//  * Returns:
//  *  list of string/integer doublets
//  */
// response.prototype.facet_fields = function(){
//     var robj = this._raw;
//     return robj.facet_counts.facet_fields;
// };

/*
 * Function: facet_field_list
 * 
 * Return a count sorted array of the response's facet fields.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  list of strings
 */
response.prototype.facet_field_list = function(){
    var robj = this._raw;
    return us.keys(robj.facet_counts.facet_fields).sort();
};

/*
 * Function: facet_field
 * 
 * Return a count-sorted array of a facet field's response.
 * 
 * : [["foo", 60], ...]
 * 
 * Arguments:
 *  facet_name - name of the facet to examine
 * 
 * Returns:
 *  list of nested lists
 */
response.prototype.facet_field = function(facet_name){
    var robj = this._raw;
    return robj.facet_counts.facet_fields[facet_name];
};

/*
 * Function: facet_counts
 * 
 * For a given facet field, return a hash of that field's items and
 * their counts.
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  hash of facets to their integer counts
 */
response.prototype.facet_counts = function(){

    var robj = this._raw;
    var ret_hash = {};

    var anchor = this;
    
    var facet_field_list = this.facet_field_list();
    us.each(facet_field_list, function(ffield){
	
	// Make sure the top field is present,
	if( ! ret_hash[ffield] ){
	    ret_hash[ffield] = {};		
	}
	
	var facet_field_items = anchor.facet_field(ffield);
	us.each(facet_field_items, function(item, index){
	    var name = item[0];
	    var count = item[1];
	    ret_hash[ffield][name] = count;
	});
    });
    
    return ret_hash;
};

/*
 * Function: query
 * 
 * Return the raw query parameter "q".
 * 
 * Arguments:
 *  n/a
 * 
 * Returns:
 *  string or null
 */
response.prototype.query = function(){
    var robj = this._raw;    
    var retval = null;
    
    if( robj.responseHeader.params && robj.responseHeader.params.q ){
	retval = robj.responseHeader.params.q;
    }
    
    return retval;
};

/*
 * Function: query_filters
 *
 * A sensible handling of the not-so-great format of "fq" returned by
 * Solr (fq can be irritating single value or irritating array, along
 * with things like "-" in front of values). Since plus and minus
 * filters are mutually exclusive, we have a return format like:
 * 
 * : {field1: {filter1: (true|false), ...}, ...}
 * 
 * Where the true|false value represents a positive (true) or negative
 * (false) filter.
 * 
 * Parameters:
 *  n/a
 *
 * Returns:
 *  a hash of keyed hashes
 */
response.prototype.query_filters = function(){
    var robj = this._raw;    
    var ret_hash = {};
    var fq_list = this.parameter('fq');
    if( fq_list ){
	
	// Ensure that it's a list and not just a naked string (as can
	// sometimes happen).
	if( bbop.what_is(fq_list) === 'string'){
	    fq_list = [fq_list];
	}
	
	// Make the return fq more tolerable.
	us.each(fq_list, function(fq_item){
	    
	    // Split everything on colons. Field is the first
	    // one, and everything else joined back together is
	    // the value of the filter. Best if you think about
	    // the GO id and non-GO id cases.
	    var splits = fq_item.split(":");
	    var field = splits.shift();
	    var value = splits.join(":"); // GO 0022008 -> GO:0022008
	    
	    // First let's just assume that we have a positive
	    // filter.
	    var polarity = true;
	    
	    // Check and see if the first value in our
	    // field is '-' or '+'. If so, edit it out, but
	    // change the polarity in the '-' case.
	    if( field.charAt(0) === '-' ){
		polarity = false;
		field = field.substring(1, field.length);
	    }else if( field.charAt(0) === '+' ){
		field = field.substring(1, field.length);
	    }
	    
	    // Ensure that there is a place in the return hash
	    // for us.
	    if( ! ret_hash[field] ){
		ret_hash[field] = {};
	    }
	    
	    // I want just the first quote and the final quote
	    // gone from the value if they are matching quotes.
	    if( value.charAt(0) === '"' &&
		value.charAt(value.length -1) === '"' ){
		    value = value.substring(1, value.length -1);
		}
	    
	    // The final filter note.
	    ret_hash[field][value] = polarity;
	    
	});
    }
    
    return ret_hash;
};

///
/// Exportable body.
///

module.exports = response;
