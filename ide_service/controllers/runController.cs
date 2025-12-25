using IdeService.Data;
using IdeService.Dtos;
using IdeService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdeService.Controllers;

[ApiController]
[Route("api/run")]
public class RunController(IdeDbContext db, JudgeService judge) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<RunResponseDto>> Run([FromBody] RunRequestDto req)
    {
        if (req.Language is not ("cpp" or "java" or "python"))
            return BadRequest(new { error = "unsupported language" });

        var p = await db.Problems
            .Include(x => x.Templates)
            .Include(x => x.Testcases)
            .FirstOrDefaultAsync(x => x.Id == req.ProblemId);

        if (p is null) return NotFound();

        if (!p.Templates.Any(t => t.Language == req.Language))
            return BadRequest(new { error = "template not found for language" });

        var tests = p.Testcases
            .Where(t => t.IsPublic)
            .OrderBy(t => t.Ord)
            .Take(3)
            .ToList();

        if (tests.Count == 0) return BadRequest(new { error = "no public testcases" });

        var overall = "AC";
        var results = new List<RunCaseResultDto>();

        foreach (var tc in tests)
        {
            var (status, stdout, stderr, timeMs, memKb) =
                await judge.RunOneAsync(req.Language, req.SourceCode, tc.InputData);

            var caseStatus = status;
            var passed = false;

            if (status == "OK")
            {
                passed = JudgeService.CheckOutput(tc.ExpectedOutput, stdout);
                if (!passed) caseStatus = "WA";
            }

            overall = JudgeService.UpdateOverall(overall, caseStatus);

            results.Add(new RunCaseResultDto(
                tc.Id, tc.Ord, caseStatus, passed,
                stdout, tc.ExpectedOutput, stderr,
                timeMs, memKb
            ));

            if (caseStatus == "CE") break;
        }

        return Ok(new RunResponseDto(overall, results));
    }
}
