import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, formula } = await req.json();
    const apiKey = Deno.env.get('CHEMSPIDER_API_KEY');
    
    if (!apiKey) {
      throw new Error('ChemSpider API key not configured');
    }

    console.log('Looking up compound:', { name, formula });

    // First, search for the compound
    let searchQuery = name;
    if (formula) {
      searchQuery = formula; // Prefer formula if available
    }

    const searchResponse = await fetch(
      `https://api.rsc.org/compounds/v1/filter/name`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        },
        body: JSON.stringify({
          name: searchQuery,
          orderBy: 'recordId',
          orderDirection: 'ascending',
        }),
      }
    );

    if (!searchResponse.ok) {
      console.error('ChemSpider search failed:', await searchResponse.text());
      throw new Error('Failed to search ChemSpider');
    }

    const searchData = await searchResponse.json();
    console.log('Search results:', searchData);

    if (!searchData.queryId) {
      return new Response(
        JSON.stringify({ error: 'No results found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Wait a bit for results to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get the search results
    const resultsResponse = await fetch(
      `https://api.rsc.org/compounds/v1/filter/${searchData.queryId}/results`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    );

    if (!resultsResponse.ok) {
      const errorText = await resultsResponse.text();
      console.error('Failed to get results:', resultsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve search results from ChemSpider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const results = await resultsResponse.json();
    console.log('Results:', results);

    if (!results.results || results.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No results found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get details for the first result
    const recordId = results.results[0];
    console.log('Fetching details for record ID:', recordId);
    
    const detailsResponse = await fetch(
      `https://api.rsc.org/compounds/v1/records/${recordId}/details`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    );

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('Failed to get details:', detailsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve compound details from ChemSpider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const details = await detailsResponse.json();
    console.log('Details:', JSON.stringify(details, null, 2));

    // Extract CAS number from external references
    let casNumber = null;
    if (details.externalReferences) {
      console.log('External references found:', details.externalReferences.length);
      for (const ref of details.externalReferences) {
        console.log('Checking reference:', ref.source, ref.externalId);
        if (ref.source === 'CAS' && ref.externalId) {
          casNumber = ref.externalId;
          console.log('Found CAS number:', casNumber);
          break;
        }
      }
    } else {
      console.log('No external references found in details');
    }

    const result = {
      casNumber,
      formula: details.formula,
      molecularWeight: details.molecularWeight,
      name: details.name,
    };
    
    console.log('Returning result:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chemspider-lookup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
