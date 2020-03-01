defmodule GraphQl.Instrumenter do
	use AbsintheMetrics,
    adapter: AbsintheMetrics.Backend.PrometheusHistogram,
    arguments: [buckets: {:exponential, 250, 1.5, 7}]
end