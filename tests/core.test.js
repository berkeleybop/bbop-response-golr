////
//// Some unit testing for package bbop-golr.
////

var us = require('underscore');

// Test stuff
var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

// Correct environment, ready testing.
var bbop = require('bbop-core');
//var amigo = require('amigo2');
var bbop_response_golr = require('..');

///
/// Start unit testing.
///


describe('bbop-response-golr', function(){

    it('1', function(){
	
	// Partial data from: http://localhost:8080/solr/select?&qt=standard&indent=on&wt=json&rows=10&start=0&fl=*%2Cscore&facet=true&facet.mincount=1&json.nl=arrarr&facet.field=source&facet.field=evidence_type&facet.field=taxon_label&facet.field=isa_partof_closure_label&facet.field=annotation_extension_class_closure_label&fq=document_category:%22annotation%22&fq=isa_partof_closure:%22GO:0022008%22&fq=-source:%22MGI%22&fq=-evidence_type:%22ISO%22&fq=isa_partof_closure_label:%22cell%20recognition%22&fq=taxon_label:%22Mus%20musculus%22&packet=5&callback_type=search&q=*:*
	// Doc contents removed for convenience.
	var robj = {
	    "responseHeader":{
		"status":0,
		"QTime":10,
		"params":{
		    "facet":"true",
		    "indent":"on",
		    "facet.mincount":"1",
		    "json.nl":"arrarr",
		    "wt":"json",
		    "callback_type":"search",
		    "rows":"10",
		    "fl":"*,score",
		    "start":"0",
		    "q":"*:*",
		    "packet":"5",
		    "facet.field":["source",
				   "evidence_type",
				   "taxon_label",
				   "isa_partof_closure_label",
				   "annotation_extension_class_closure_label"],
		    "qt":"standard",
		    "fq":["document_category:\"annotation\"",
			  "isa_partof_closure:\"GO:0022008\"",
			  "-source:\"MGI\"",
			  "-evidence_type:\"ISO\"",
			  "isa_partof_closure_label:\"cell recognition\"",
			  "taxon_label:\"Mus musculus\""]}},
	    "response":{"numFound":8,"start":0,"maxScore":1.0,"docs":[
		{}, {}, {}, {}, {}, {}, {}, {}]
		       },
	    "facet_counts":{
		"facet_queries":{},
		"facet_fields":{
		    "source":
		    [
			["UniProtKB",7],
			["BHF-UCL",1]],
		    "evidence_type":
		    [
			["IMP",5],
			["IGI",1],
			["ISS",1],
			["TAS",1]],
		    "taxon_label":
		    [
			["Mus musculus",8]],
		    "isa_partof_closure_label":
		    [
			["anatomical structure development",8],
			["biological_process",8],
			["cell development",8],
			["cell differentiation",8],
			["cell recognition",8],
			["cellular developmental process",8],
			["cellular process",8],
			["developmental process",8],
			["generation of neurons",8],
			["multicellular organismal development",8],
			["multicellular organismal process",8],
			["nervous system development",8],
			["neurogenesis",8],
			["neuron development",8],
			["neuron differentiation",8],
			["neuron recognition",8],
			["system development",8],
			["anatomical structure morphogenesis",6],
			["axonogenesis",6],
			["cell morphogenesis",6],
			["cell morphogenesis involved in differentiation",6],
			["cell morphogenesis involved in neuron differentiation",6],
			["cell part morphogenesis",6],
			["cell projection morphogenesis",6],
			["cell projection organization",6],
			["cellular component morphogenesis",6],
			["cellular component organization",6],
			["cellular component organization at cellular level",6],
			["cellular component organization or biogenesis",6],
			["cellular component organization or biogenesis at cellular level",6],
			["neuron projection development",6],
			["neuron projection morphogenesis",6],
			["axonal fasciculation",5],
			["axon choice point recognition",1],
			["axon guidance",1],
			["axon midline choice point recognition",1],
			["chemotaxis",1],
			["dendrite self-avoidance",1],
			["fasciculation of motor neuron axon",1],
			["fasciculation of sensory neuron axon",1],
			["locomotion",1],
			["response to chemical stimulus",1],
			["response to external stimulus",1],
			["response to stimulus",1],
			["taxis",1]],
		    "annotation_extension_class_closure_label":
		    []},
		"facet_dates":{},
		"facet_ranges":{}}};

	// Laziness.
	var bgr = new bbop_response_golr(robj);

	// Absolute basics.
	assert.isTrue(bgr.success(), 'looks like success');
	assert.equal(bgr.callback_type(), 'search',
		     'looks like a "search"');

	// parameter
	assert.equal(bgr.parameter('rows'), '10',
		     'found a parameter');
	
	// row_step
	assert.equal(bgr.row_step(), 10,
		     'found a row step');     
	
	// total_documents
	assert.equal(bgr.total_documents(), 8,
		     '8 docs');     
	
	// start_document
	assert.equal(bgr.start_document(), 1,
		     'no offset start == 1');
	
	// end_document
	assert.equal(bgr.end_document(), 8,
		     'no offset end == 8');
	
	// documents
	assert.equal(bgr.documents().length, 8,
		     '8 docs');

	// facet_field_list
	assert.sameMembers(bgr.facet_field_list(),
			   ["source",
			    "evidence_type",
			    "taxon_label",
			    "isa_partof_closure_label",
			    "annotation_extension_class_closure_label"],
			   "all expected in facet list");

	// facet_field
	assert.equal(bgr.facet_field('evidence_type').length, 4,
		     '4 evidence_type facets');
	assert.equal(bgr.facet_field('evidence_type')[0][0], "IMP",
		     'IMP evidence_type facet');
	assert.equal(bgr.facet_field('evidence_type')[0][1], 5,
		     'IMP evidence_type facet count');
	assert.equal(bgr.facet_field('evidence_type')[1][0], "IGI",
		     'IGI evidence_type facet');
	assert.equal(bgr.facet_field('evidence_type')[1][1], 1,
		     'IGI evidence_type facet count');
	assert.equal(bgr.facet_field('evidence_type')[2][0], "ISS",
		     'ISS evidence_type facet');
	assert.equal(bgr.facet_field('evidence_type')[2][1], 1,
		     'ISS evidence_type facet count');
	assert.equal(bgr.facet_field('evidence_type')[3][0], "TAS",
		     'TAS evidence_type facet');
	assert.equal(bgr.facet_field('evidence_type')[3][1], 1,
		     'TAS evidence_type facet count');

	// query
	assert.equal(bgr.query(), '*:*',
		     'all query');

	// query_filters
	assert.isTrue(bgr.query_filters()['document_category']['annotation'],
		      '+ document_category annotation');
	assert.isTrue(bgr.query_filters()['isa_partof_closure']['GO:0022008'],
		      '+ isa_partof_closure GO:0022008');
	assert.isTrue(bgr.query_filters()['isa_partof_closure_label']['cell recognition'], '+ isa_partof_closure_label cell recognition');
	assert.isTrue(bgr.query_filters()['taxon_label']['Mus musculus'],
		      '+ taxon_label Mus musculus');
	assert.isFalse(bgr.query_filters()['source']['MGI'],
		       '- source MGI');
	assert.isFalse(bgr.query_filters()['evidence_type']['ISO'],
		       '- evidence_type ISO');

	// paging_*
	assert.isFalse(bgr.paging_p(), 'paging: no');
	assert.isFalse(bgr.paging_previous_p(), 'paging: no back');
	assert.isFalse(bgr.paging_next_p(), 'paging: no forward');

	// packet
	assert.equal(bgr.packet(), 5, 'looks like the fifth packet');

	// facet_counts
	assert.equal(bgr.facet_counts()['source']['BHF-UCL'], 1,
		     'random facet count 1');
	assert.equal(bgr.facet_counts()['isa_partof_closure_label']['axonogenesis'], 6, 'random facet count 2');

    });

});

// 
describe('bbop-golr-response (other ops)', function(){

    it('get_doc, get_doc_field, get_doc_highlight', function(){
	
	var robj = {
	    "responseHeader":{
		"status":0,
		"QTime":23,
		"params":{
		    "facet":"true",
		    "facet.mincount":"1",
		    "indent":"on",
		    "qf":["annotation_class^2",
			  "annotation_class_label_searchable^1",
			  "bioentity^2",
			  "bioentity_label_searchable^1",
			  "annotation_extension_class^2",
			  "annotation_extension_class_label_searchable^1"],
		    "hl.simple.pre":"<em class=\"hilite\">",
		    "json.nl":"arrarr",
		    "wt":"json",
		    "callback_type":"search",
		    "hl":"true",
		    "rows":"2",
		    "defType":"edismax",
		    "fl":"*,score",
		    "start":"0",
		    "q":"tag*",
		    "packet":"2",
		    "facet.field":["source",
				   "evidence_type",
				   "taxon_label",
				   "isa_partof_closure_label",
				   "annotation_extension_class_closure_label"],
		    "qt":"standard",
		    "fq":"document_category:\"annotation\""}},
	    "response":{"numFound":48,"start":0,"maxScore":1.0,"docs":[
		{
		    "document_category":"annotation",
		    "id":"PomBase:SPCC548.04_:_GO:0031386",
		    "bioentity":"PomBase:SPCC548.04",
		    "bioentity_label":"urm1",
		    "bioentity_label_searchable":"urm1",
		    "source":"PomBase",
		    "date":"20051107",
		    "taxon":"NCBITaxon:4896",
		    "taxon_label":"Schizosaccharomyces pombe",
		    "taxon_label_searchable":"Schizosaccharomyces pombe",
		    "reference":"GO_REF:0000024",
		    "evidence_type":"ISO",
		    "annotation_class":"GO:0031386",
		    "annotation_class_label":"protein tag",
		    "annotation_class_label_searchable":"protein tag",
		    "isa_partof_closure_map":"{\"GO:0003674\":\"molecular_function\",\"GO:0031386\":\"protein tag\"}",
		    "isa_partof_closure":["GO:0003674","GO:0031386"],
		    "isa_partof_closure_label":["molecular_function","protein tag"],
		    "evidence_with":["SGD:S000001270"],
		    "isa_partof_closure_label_searchable":[
			"molecular_function",
			"protein tag"],
		    "score":1.0},
		{
		    "document_category":"annotation",
		    "id":"PomBase:SPAC1783.06c_:_GO:0031386",
		    "bioentity":"PomBase:SPAC1783.06c",
		    "bioentity_label":"atg12",
		    "bioentity_label_searchable":"atg12",
		    "source":"PomBase",
		    "date":"20091125",
		    "taxon":"NCBITaxon:4896",
		    "taxon_label":"Schizosaccharomyces pombe",
		    "taxon_label_searchable":"Schizosaccharomyces pombe",
		    "reference":"GO_REF:0000024",
		    "evidence_type":"ISS",
		    "annotation_class":"GO:0031386",
		    "annotation_class_label":"protein tag",
		    "annotation_class_label_searchable":"protein tag",
		    "isa_partof_closure_map":"{\"GO:0003674\":\"molecular_function\",\"GO:0031386\":\"protein tag\"}",
		    "isa_partof_closure":["GO:0003674","GO:0031386"],
		    "isa_partof_closure_label":["molecular_function","protein tag"],
		    "evidence_with":["SGD:S000000421"],
		    "isa_partof_closure_label_searchable":[
			"molecular_function",
			"protein tag"],
		    "score":1.0}]
		       },
	    "facet_counts":{
		"facet_queries":{},
		"facet_fields":{
		    "source":
		    [
			["dictyBase",25],
			["ZFIN",16],
			["PomBase",5],
			["MGI",1],
			["UniProtKB",1]],
		    "evidence_type":
		    [
			["ISS",22],
			["IEA",9],
			["IMP",8],
			["ND",4],
			["IDA",2],
			["ISO",1],
			["NAS",1],
			["TAS",1]],
		    "taxon_label":
		    [
			["Dictyostelium discoideum",25],
			["Danio rerio",16],
			["Schizosaccharomyces pombe",5],
			["Mus musculus",2]],
		    "isa_partof_closure_label":
		    [
			["biological_process",29],
			["molecular_function",20],
			["metabolic process",13],
			["cellular process",11],
			["developmental process",10],
			["catalytic activity",9],
			["hydrolase activity",9],
			["primary metabolic process",9],
			["cellular_component",8],
			["establishment of localization",8],
			["localization",8],
			["protein tag",8],
			["transport",8],
			["single-organism process",7],
			["anatomical structure development",6],
			["multicellular organismal development",6],
			["multicellular organismal process",6],
			["single-multicellular organism process",6],
			["aromatic compound catabolic process",5],
			["carbohydrate derivative catabolic process",5],
			["carbohydrate derivative metabolic process",5],
			["catabolic process",5],
			["cellular aromatic compound metabolic process",5],
			["cellular catabolic process",5],
			["cellular metabolic process",5],
			["cellular nitrogen compound catabolic process",5],
			["cellular nitrogen compound metabolic process",5],
			["heterocycle catabolic process",5],
			["heterocycle metabolic process",5],
			["hydrolase activity, acting on acid anhydrides",5],
			["hydrolase activity, acting on acid anhydrides, in phosphorus-containing anhydrides",5],
			["nitrogen compound metabolic process",5],
			["nucleobase-containing compound catabolic process",5],
			["nucleobase-containing compound metabolic process",5],
			["nucleobase-containing small molecule metabolic process",5],
			["nucleoside phosphate catabolic process",5],
			["nucleoside phosphate metabolic process",5],
			["nucleoside triphosphate catabolic process",5],
			["nucleoside triphosphate metabolic process",5],
			["nucleoside-triphosphatase activity",5],
			["nucleotide catabolic process",5],
			["nucleotide metabolic process",5],
			["organ development",5],
			["organic cyclic compound catabolic process",5],
			["organic cyclic compound metabolic process",5],
			["organic substance metabolic process",5],
			["organophosphate catabolic process",5],
			["organophosphate metabolic process",5],
			["purine nucleoside triphosphate catabolic process",5],
			["purine nucleoside triphosphate metabolic process",5],
			["purine nucleotide catabolic process",5],
			["purine nucleotide metabolic process",5],
			["purine ribonucleoside triphosphate catabolic process",5],
			["purine ribonucleoside triphosphate metabolic process",5],
			["purine ribonucleotide catabolic process",5],
			["purine ribonucleotide metabolic process",5],
			["purine-containing compound catabolic process",5],
			["purine-containing compound metabolic process",5],
			["pyrophosphatase activity",5],
			["ribonucleoside triphosphate catabolic process",5],
			["ribonucleoside triphosphate metabolic process",5],
			["ribonucleotide catabolic process",5],
			["ribonucleotide metabolic process",5],
			["small molecule metabolic process",5],
			["system development",5],
			["ATP catabolic process",4],
			["ATP metabolic process",4],
			["ATPase activity",4],
			["ATPase activity, coupled",4],
			["ATPase activity, coupled to movement of substances",4],
			["ATPase activity, coupled to transmembrane movement of substances",4],
			["P-P-bond-hydrolysis-driven transmembrane transporter activity",4],
			["active transmembrane transporter activity",4],
			["biological regulation",4],
			["hydrolase activity, acting on acid anhydrides, catalyzing transmembrane movement of substances",4],
			["integral to membrane",4],
			["intrinsic to membrane",4],
			["macromolecule metabolic process",4],
			["membrane",4],
			["membrane part",4],
			["muscle organ development",4],
			["muscle structure development",4],
			["peptidase activity",4],
			["peptidase activity, acting on L-amino acid peptides",4],
			["primary active transmembrane transporter activity",4],
			["protein metabolic process",4],
			["proteolysis",4],
			["regulation of biological process",4],
			["regulation of cellular process",4],
			["serine hydrolase activity",4],
			["serine-type peptidase activity",4],
			["transmembrane transport",4],
			["transmembrane transporter activity",4],
			["transporter activity",4],
			["cell differentiation",3],
			["cell",2],
			["cell part",2],
			["cellular component organization",2],
			["cellular component organization or biogenesis",2],
			["cellular developmental process",2]],
		    "annotation_extension_class_closure_label":
		    []},
		"facet_dates":{},
		"facet_ranges":{}},
	    "highlighting":{
		"PomBase:SPCC548.04_:_GO:0031386":{
		    "annotation_class_label_searchable":
		    ["protein <em class=\"hilite\">tag</em>"]},
		"PomBase:SPAC1783.06c_:_GO:0031386":{
		    "annotation_class_label_searchable":
		    ["protein <em class=\"hilite\">tag</em>"]}}};

	var bgr = new bbop_response_golr(robj);

	// get_doc
	var di0 = bgr.get_doc(0);
	assert.equal(di0['id'], 'PomBase:SPCC548.04_:_GO:0031386',
		     'get_doc: [0]');
	var di1 = bgr.get_doc(1);
	assert.equal(di1['id'], 'PomBase:SPAC1783.06c_:_GO:0031386',
		     'get_doc: [1]');
	var di2 = bgr.get_doc(2);
	assert.equal(di2, null,
		     'get_doc: [2]');
	var do0 = bgr.get_doc('PomBase:SPCC548.04_:_GO:0031386');
	assert.equal(do0['id'], 'PomBase:SPCC548.04_:_GO:0031386',
		     'get_doc: do0');
	var do1 = bgr.get_doc('PomBase:SPAC1783.06c_:_GO:0031386');
	assert.equal(do1['id'], 'PomBase:SPAC1783.06c_:_GO:0031386',
		     'get_doc: do1');
	var do2 = bgr.get_doc('foo');
	assert.equal(do2, null,
		     'get_doc: do2');

	// get_doc_field
	var did = 'PomBase:SPCC548.04_:_GO:0031386';
	assert.equal(bgr.get_doc_field(0, 'id'), did,
		     'get_doc_field: [0]');
	assert.equal(bgr.get_doc_field(1, 'id'),
		     'PomBase:SPAC1783.06c_:_GO:0031386',
		     'get_doc_field: [1]');
	assert.equal(bgr.get_doc_field(2, 'id'), null,
		     'get_doc_field: [2]');
	assert.equal(bgr.get_doc_field(did, 'id'), did,
		     'get_doc_field: id 0');
	assert.equal(bgr.get_doc_field(did, 'id'), did,
		     'get_doc_field: id 1');
	assert.equal(bgr.get_doc_field('foo', 'id'), null,
		     'get_doc_field: id foo');

	// get_doc_highlight
	assert.equal(bgr.get_doc_highlight(0, 'id', 'protein tag'), null,
		     'get_doc_highlight: [0]');
	assert.equal(bgr.get_doc_highlight(1, 'foo', 'protein tag'), null,
		     'get_doc_highlight: no foo 1', 'protein tag');
	assert.equal(bgr.get_doc_highlight(2, 'foo'), null,
		     'get_doc_highlight: no foo 2', 'protein tag');
	assert.equal(bgr.get_doc_highlight(did, 'annotation_class_label_searchable', 'protein tag'),
		     'protein <em class=\"hilite\">tag</em>',
		     'get_doc_highlight: id acls');
	assert.equal(bgr.get_doc_highlight(1, 'annotation_class_label_searchable', 'protein tag'),
		     'protein <em class=\"hilite\">tag</em>',
		     'get_doc_highlight: [1] acls');

	// Trying out a bit of get_doc_label...
	// Should fail since technically there is not enough evidence to prove that 
	// we're looking at the thing we want.
	assert.equal(bgr.get_doc_label(0, 'bioentity'),
		     'urm1',
		     'get_doc_label: trivial look-up');
	assert.equal(bgr.get_doc_label(0, 'evidence_with'),
		     null,
		     'get_doc_label: no label possible');
	assert.equal(bgr.get_doc_label(0, 'isa_partof_closure'),
		     null,
		     'get_doc_label: not enough evidence');
	assert.equal(bgr.get_doc_label(0, 'isa_partof_closure', "GO:0003674"),
		     'molecular_function',
		     'get_doc_label: enough evidence 1');
	assert.equal(bgr.get_doc_label(0, 'isa_partof', "GO:0003674"),
		     null,
		     'get_doc_label: no label part, so early bail');
    });

});
