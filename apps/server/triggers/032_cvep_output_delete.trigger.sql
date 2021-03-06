CREATE TRIGGER IF NOT EXISTS cvep_output_delete BEFORE DELETE
    ON experiment_cvep_entity
    WHEN (SELECT enabled FROM trigger_control WHERE trigger_control.name = 'cvep_output_delete')=1
BEGIN
    DELETE FROM experiment_cvep_output_entity WHERE experimentId = old.id;
    DELETE FROM experiment_result_entity WHERE experimentID = old.id;
END;
