from typing import Dict, Optional
import openai
from datetime import datetime

class MessageEngine:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    async def generate_follow_up(
        self,
        client_data: Dict,
        sales_history: Optional[Dict] = None,
        last_interaction: Optional[Dict] = None
    ) -> str:
        """Generate a personalized follow-up message for a client."""
        
        # Create context for the AI
        context = f"""
        Client: {client_data['first_name']} {client_data['last_name']}
        Last Contact: {client_data.get('last_contact', 'Never')}
        Lifetime Spend: ${client_data.get('lifetime_spend', 0):,.2f}
        """

        if sales_history:
            context += f"\nRecent Purchase: {sales_history['latest_item']}"

        if last_interaction:
            context += f"\nLast Interaction Notes: {last_interaction['notes']}"

        prompt = f"""
        Based on this customer information, generate a friendly, professional follow-up message:
        {context}

        The message should be:
        1. Personal and reference specific details
        2. Professional but warm in tone
        3. Include a clear call to action
        4. No more than 3 short paragraphs
        """

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert furniture sales professional."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error generating follow-up message: {str(e)}"

    async def analyze_client_profile(self, client_history: Dict) -> Dict:
        """Generate insights and recommendations based on client history."""
        
        prompt = f"""
        Analyze this customer profile and provide insights:
        
        Name: {client_history['first_name']} {client_history['last_name']}
        Total Purchases: {client_history.get('total_purchases', 0)}
        Lifetime Value: ${client_history.get('lifetime_spend', 0):,.2f}
        Purchase History: {client_history.get('purchase_summary', 'No purchases yet')}
        Last Interaction: {client_history.get('last_interaction', 'No interactions recorded')}

        Provide:
        1. Key observations about their preferences
        2. Potential opportunities
        3. Recommended next actions
        """

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in customer analysis and furniture retail."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            analysis = response.choices[0].message.content.strip()
            return {
                "analysis": analysis,
                "generated_at": datetime.now().isoformat(),
                "client_id": client_history.get('id')
            }
        except Exception as e:
            return {
                "error": str(e),
                "generated_at": datetime.now().isoformat(),
                "client_id": client_history.get('id')
            }
