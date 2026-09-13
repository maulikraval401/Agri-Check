export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { image } = await req.json();

    const roboflowRes = await fetch(
      'https://serverless.roboflow.com/maulik-raval/workflows/cotton-leaf-health-vcotton-leaf-health-1-resnet18-t1-logic',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer MQCqehaGR5aX3HHVtN1Z',
        },
        body: JSON.stringify({
          inputs: {
            image: { type: 'base64', value: image },
          },
        }),
      },
    );

    const text = await roboflowRes.text();

    return new Response(
      JSON.stringify({ status: roboflowRes.status, raw: text }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
