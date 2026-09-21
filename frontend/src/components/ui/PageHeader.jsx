export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between w-full">
      <div>
        <h1 className="m-0 text-2xl font-semibold text-gray-900">{title}</h1>

        {description && (
          <p className="mt-1.5 text-sm text-gray-500">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
