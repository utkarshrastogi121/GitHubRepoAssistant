

import { prisma } from "../config/db";
import { CodeGraph, GraphNode } from "./types";

export async function saveCodeGraph(
  repositoryId: string,
  graph: CodeGraph
): Promise<{ nodes: number; edges: number }> {
  await prisma.$transaction([
    prisma.codeEdge.deleteMany({ where: { repositoryId } }),
    prisma.codeNode.deleteMany({ where: { repositoryId } }),
  ]);

  if (graph.nodes.length > 0) {
    await prisma.codeNode.createMany({
      data: graph.nodes.map((n) => ({
        repositoryId,
        nodeId: n.id,
        kind: n.kind,
        name: n.name,
        filePath: n.filePath,
        symbol: n.symbol ?? null,
        line: n.line ?? null,
      })),
      skipDuplicates: true,
    });
  }

  if (graph.edges.length > 0) {
    await prisma.codeEdge.createMany({
      data: graph.edges.map((e) => ({
        repositoryId,
        fromNodeId: e.fromId,
        toNodeId: e.toId,
        type: e.type,
      })),
      skipDuplicates: true,
    });
  }

  return { nodes: graph.nodes.length, edges: graph.edges.length };
}

export async function loadCodeGraph(
  repositoryId: string
): Promise<CodeGraph> {
  const [dbNodes, dbEdges] = await Promise.all([
    prisma.codeNode.findMany({ where: { repositoryId } }),
    prisma.codeEdge.findMany({ where: { repositoryId } }),
  ]);

  const nodes: GraphNode[] = dbNodes.map((n) => ({
    id: n.nodeId,
    kind: n.kind as GraphNode["kind"],
    name: n.name,
    filePath: n.filePath,
    symbol: n.symbol,
    line: n.line,
  }));

  return {
    nodes,
    edges: dbEdges.map((e) => ({
      fromId: e.fromNodeId,
      toId: e.toNodeId,
      type: e.type as CodeGraph["edges"][number]["type"],
    })),
  };
}

/** True when a repo has been indexed with the graph builder. */
export async function hasCodeGraph(repositoryId: string): Promise<boolean> {
  const count = await prisma.codeNode.count({ where: { repositoryId } });
  return count > 0;
}
