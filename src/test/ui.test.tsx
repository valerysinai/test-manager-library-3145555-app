import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../ui";

describe("field labels", () => {
  it("keeps category labels exact and distinct from select options in simultaneous forms", () => {
    render(
      <>
        <form aria-label="Filtro">
          <Field label="Categoría">
            <select name="filter">
              <option>Todas las categorías</option>
              <option>Novela</option>
            </select>
          </Field>
        </form>
        <form aria-label="Alta">
          <Field label="Categoría">
            <select name="category_id">
              <option>Selecciona una categoría</option>
              <option>Ciencia</option>
            </select>
          </Field>
        </form>
      </>,
    );
    const filter = within(
      screen.getByRole("form", { name: "Filtro" }),
    ).getByLabelText("Categoría", { exact: true }) as HTMLSelectElement;
    const create = within(
      screen.getByRole("form", { name: "Alta" }),
    ).getByLabelText("Categoría", { exact: true }) as HTMLSelectElement;
    expect(filter.id).not.toBe(create.id);
    for (const control of [filter, create]) {
      expect(control.labels).toHaveLength(1);
      expect(control.labels![0].textContent).toBe("Categoría");
      expect(control.labels![0].control).toBe(control);
      expect(control).toHaveAccessibleName("Categoría");
    }
  });

  it("preserves the label association and keyboard focus across a rerender", async () => {
    const user = userEvent.setup();
    const view = render(
      <Field label="Documento">
        <input name="document_number" />
      </Field>,
    );
    const control = screen.getByLabelText("Documento") as HTMLInputElement;
    const originalId = control.id;
    expect(originalId).not.toBe("");
    await user.tab();
    expect(control).toHaveFocus();
    await user.type(control, "DOC-1");
    view.rerender(
      <Field label="Documento">
        <input name="document_number" required />
      </Field>,
    );
    expect(screen.getByLabelText("Documento")).toBe(control);
    expect(control.id).toBe(originalId);
    expect(control).toHaveValue("DOC-1");
    expect(control).toHaveFocus();
  });
});
