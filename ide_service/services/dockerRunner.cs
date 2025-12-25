using System.Diagnostics;

namespace IdeService.Services
{

    public class DockerRunner(IConfiguration cfg)
    {
        private string Image => cfg["Runner:Image"] ?? cfg["RUNNER_IMAGE"] ?? "learnix-runner:latest";
        private int TimeoutMs => int.TryParse(cfg["Runner:TimeoutMs"] ?? cfg["SANDBOX_TIMEOUT_MS"], out var t) ? t : 2500;

        private string Cpu => cfg["Runner:Cpu"] ?? cfg["SANDBOX_CPU"] ?? "1.0";
        private string Mem => cfg["Runner:Memory"] ?? cfg["SANDBOX_MEM"] ?? "256m";
        private string Pids => cfg["Runner:Pids"] ?? cfg["SANDBOX_PIDS"] ?? "128";

        private int MaxOut => int.TryParse(cfg["Runner:MaxOutputBytes"] ?? cfg["MAX_OUTPUT_BYTES"], out var m) ? m : 1_048_576;

        public async Task<(int exitCode, string stdout, string stderr, long timeMs, long memKb)> RunAsync(
            string language, string sourceCode, string mainFileName, string input)
        {
            var hostBaseDir = (cfg["HOST_SANDBOX_DIR"] ?? throw new Exception("HOST_SANDBOX_DIR not configured")).TrimEnd('/', '\\').Replace("\\", "/");
            var containerBase = cfg["CONTAINER_SANDBOX_DIR"] ?? "/sandbox_host".TrimEnd('/');

            var runDir = "ide-run-" + Guid.NewGuid().ToString("N");
            var runDirInContainer = $"{containerBase}/{runDir}";

            Directory.CreateDirectory(runDirInContainer);
            var runDirOnHost = $"{hostBaseDir}/{runDir}";
            Console.Error.WriteLine($"[paths] runDirInContainer={runDirInContainer}");
            Console.Error.WriteLine($"[paths] runDirOnHost={runDirOnHost}");
            Console.Error.WriteLine($"[paths] codeFile={Path.Combine(runDirInContainer, mainFileName)}");
            try
            {
                var codePath = Path.Combine(runDirInContainer, mainFileName);
                await File.WriteAllTextAsync(codePath, sourceCode);

                var timeoutSec = Math.Max(1, (int)Math.Ceiling(TimeoutMs / 1000.0));

                var args =
                    "run --rm -i " +
                    $"--network=none " +
                    $"--cpus {Cpu} --memory {Mem} --pids-limit {Pids} " +
                    $"--read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m " +
                    $"-v \"{runDirOnHost}:/work:rw\" " +
                    $"-e LANG={language} -e SRC={mainFileName}  -e TIMEOUT_SEC={timeoutSec} " +
                    $"{Image}";

                var psi = new ProcessStartInfo("docker", args)
                {
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false
                };

                var sw = Stopwatch.StartNew();
                Console.Error.WriteLine("[docker] " + args);
                using var p = Process.Start(psi)!;

                if (!string.IsNullOrEmpty(input))
                {
                    await p.StandardInput.WriteAsync(input);
                }
                p.StandardInput.Close();

                var cts = new CancellationTokenSource(TimeoutMs + 500);
                var stdoutTask = p.StandardOutput.ReadToEndAsync();
                var stderrTask = p.StandardError.ReadToEndAsync();

                while (!p.HasExited && !cts.IsCancellationRequested)
                    await Task.Delay(30);

                if (!p.HasExited)
                {
                    try { p.Kill(entireProcessTree: true); } catch { }
                }

                var stdout = await stdoutTask;
                var stderr = await stderrTask;
                sw.Stop();

                if (stdout.Length > MaxOut) stdout = stdout[..MaxOut];
                if (stderr.Length > MaxOut) stderr = stderr[..MaxOut];

                var exit = p.HasExited ? p.ExitCode : 30; // treat as TLE
                var memKb = OutputNormalize.ParseMaxRssKb(stderr);

                return (exit, stdout, stderr, sw.ElapsedMilliseconds, memKb);
            }
            finally
            {
                try { Directory.Delete(runDirInContainer, recursive: true); } catch { }
            }
        }
    }
}
