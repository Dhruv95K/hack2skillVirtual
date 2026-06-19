import { OffsetsClient } from './offsets-client';

export const metadata = {
  title: 'Carbon Offsets | EcoTrack',
  description: 'Support verified carbon offset programs',
};

export default function OffsetsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Carbon Offset Programs</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Carbon offsets allow you to compensate for your emissions by funding projects that reduce greenhouse gases elsewhere. 
          By supporting these verified programs, you can take immediate climate action while working to reduce your own footprint.
        </p>
      </div>
      
      <OffsetsClient />

      <div className="mt-8 text-center pb-8">
        <p className="text-sm text-muted-foreground">
          EcoTrack does not earn commissions from these programs.
        </p>
      </div>
    </div>
  );
}
