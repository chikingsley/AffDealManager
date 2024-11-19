STRUCTURAL_ANALYSIS_PROMPT = """Analyze the structure of the deal text and identify the individual deals and shared context.

Input Format:
Deal text as a single string

Output Format:
{
    "deals": [
        {
            "text": string,
            "partner": string,
            "shared_fields": {
                "language": string,
                "source": string,
                "model": string,
                "deduction_limit": number|null
            }
        }
    ]
}

Key Rules:
1. Deals are separated by a line containing "Partner:" or "Company:" followed by the partner name.
2. Shared fields (language, source, model, deduction limit) apply until the next partner declaration.
3. The "text" field contains the original deal text for that section.
"""

def run_structural_analysis(deal_text: str) -> dict:
    deals = []
    current_deal = {
        "text": "",
        "partner": None,
        "shared_fields": {
            "language": None,
            "source": None,
            "model": None,
            "deduction_limit": None
        }
    }

    for line in deal_text.split("\n"):
        if "Partner:" in line or "Company:" in line:
            if current_deal["text"]:
                deals.append(current_deal)
            current_deal = {
                "text": "",
                "partner": line.split(":")[1].strip(),
                "shared_fields": {
                    "language": None,
                    "source": None,
                    "model": None,
                    "deduction_limit": None
                }
            }
        else:
            current_deal["text"] += line.strip() + "\n"

    if current_deal["text"]:
        deals.append(current_deal)

    return {"deals": deals}

AFFILIATE_PARSING_PROMPT = """Parse individual deal details from the perspective of an affiliate marketing expert.

Input Format:
{
    "deal_text": string,
    "shared_fields": {
        "partner": string,
        "language": string,
        "source": string,
        "model": string,
        "deduction_limit": number|null
    }
}

Output Format:
{
    "raw_text": string,
    "parsed_data": {
        "partner": string,
        "region": "TIER1"|"TIER2"|"TIER3"|"LATAM"|"NORDICS"|"BALTICS",
        "geo": string,
        "language": string,
        "source": string,
        "pricing_model": "CPA"|"CPA/CRG"|"CPL",
        "cpa": number|null,
        "crg": number|null,
        "cpl": number|null,
        "funnels": string[],
        "cr": number|null,
        "deduction_limit": number|null
    }
}

As an affiliate marketing expert, focus on accurately extracting the fields that are most relevant to your domain, such as:
- Pricing model (CPA, CPA/CRG, CPL)
- Specific pricing details (CPA, CRG, CPL)
- Funnels
- Conversion rate (CR)
- Deduction limit

Pay close attention to the shared context provided, as it can help you resolve ambiguities or missing information in the deal text.
"""

SCIENTIFIC_PARSING_PROMPT = """Parse individual deal details from a data-driven, analytical perspective.

Input Format:
{
    "deal_text": string,
    "shared_fields": {
        "partner": string,
        "language": string,
        "source": string,
        "model": string,
        "deduction_limit": number|null
    }
}

Output Format:
{
    "raw_text": string,
    "parsed_data": {
        "partner": string,
        "region": "TIER1"|"TIER2"|"TIER3"|"LATAM"|"NORDICS"|"BALTICS",
        "geo": string,
        "language": string,
        "source": string,
        "pricing_model": "CPA"|"CPA/CRG"|"CPL",
        "cpa": number|null,
        "crg": number|null,
        "cpl": number|null,
        "funnels": string[],
        "cr": number|null,
        "deduction_limit": number|null
    },
    "validation_issues": [
        {
            "field": string,
            "message": string
        }
    ]
}

As a data-driven expert, focus on:
- Ensuring data consistency and normalization
- Identifying any anomalies or outliers in the deal data
- Performing thorough validation checks, such as:
  - Checking for missing required fields
  - Verifying that field values are within expected ranges
  - Flagging any potentially contradictory information
- Providing feedback on areas that may need further investigation or clarification
"""

def orchestrate_parsing(deal_text: str) -> dict:
    # Step 1: Run Structural Analysis
    structural_analysis = run_structural_analysis(deal_text)

    # Step 2: Parse deals with Affiliate Expert
    affiliate_parsed_deals = []
    for deal in structural_analysis["deals"]:
        affiliate_parsed = run_affiliate_parsing(deal["text"], deal["shared_fields"])
        affiliate_parsed_deals.append(affiliate_parsed)

    # Step 3: Parse deals with Scientific Expert
    scientific_parsed_deals = []
    for deal in structural_analysis["deals"]:
        scientific_parsed = run_scientific_parsing(deal["text"], deal["shared_fields"])
        scientific_parsed_deals.append(scientific_parsed)

    # Step 4: Compare and Consolidate Parsing Results
    consolidated_deals = []
    for affiliate_deal, scientific_deal in zip(affiliate_parsed_deals, scientific_parsed_deals):
        consolidated = consolidate_parsing_results(affiliate_deal, scientific_deal)
        consolidated_deals.append(consolidated)

    return {"deals": consolidated_deals}

def run_affiliate_parsing(deal_text: str, shared_fields: dict) -> dict:
    # Implement the Affiliate Parsing Prompt logic here
    pass

def run_scientific_parsing(deal_text: str, shared_fields: dict) -> dict:
    # Implement the Scientific Parsing Prompt logic here
    pass

def consolidate_parsing_results(affiliate_parsed: dict, scientific_parsed: dict) -> dict:
    # Compare the affiliate and scientific parsing results
    # Resolve any discrepancies or missing information
    # Return the consolidated parsed deal data
    pass