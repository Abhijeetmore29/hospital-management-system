export function PaymentSection({ settings }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Online Payment</h3>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">UPI / Bank</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="grid place-items-center rounded-3xl border border-slate-200 bg-slate-50 p-4">
          {settings?.qrCodeUrl ? (
            <img src={settings.qrCodeUrl} alt="QR Code" className="h-36 w-36 rounded-2xl object-contain" />
          ) : (
            <div className="grid h-36 w-36 place-items-center rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
              QR Code
            </div>
          )}
        </div>
        <div className="grid gap-3 text-sm text-slate-700">
          <div><span className="text-slate-500">UPI ID:</span> {settings?.upiId || '-'}</div>
          <div><span className="text-slate-500">Payee:</span> {settings?.upiPayeeName || '-'}</div>
          <div><span className="text-slate-500">Bank:</span> {settings?.bankName || '-'}</div>
          <div><span className="text-slate-500">Account Holder:</span> {settings?.accountHolderName || '-'}</div>
          <div><span className="text-slate-500">Account Number:</span> {settings?.accountNumber || '-'}</div>
          <div><span className="text-slate-500">IFSC:</span> {settings?.ifscCode || '-'}</div>
        </div>
      </div>
    </section>
  );
}
